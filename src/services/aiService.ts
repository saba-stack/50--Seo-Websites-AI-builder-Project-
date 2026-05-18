import { AiProvider, ArticleStatus, GenerationType, IntegrationProvider } from "@prisma/client";
import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { prisma } from "../config/prisma";
import { integrationService } from "./integrationService";
import { settingService } from "./settingService";
import { AppError } from "../utils/appError";

type SupportedProvider = "OPENAI" | "CLAUDE" | "DEEPSEEK";

interface GenerateInput {
  cityId: string;
  articleId?: string;
  type: GenerationType;
  prompt: string;
  preferredProvider?: SupportedProvider;
}

const routingByType: Record<GenerationType, SupportedProvider[]> = {
  SUMMARY: ["DEEPSEEK", "CLAUDE", "OPENAI"],
  REWRITE: ["CLAUDE", "OPENAI", "DEEPSEEK"],
  HEADLINE: ["OPENAI", "CLAUDE", "DEEPSEEK"],
  SEO: ["OPENAI", "CLAUDE", "DEEPSEEK"],
  NEWSLETTER: ["CLAUDE", "OPENAI", "DEEPSEEK"],
  SOCIAL_CAPTION: ["DEEPSEEK", "OPENAI", "CLAUDE"]
};

const modelByProvider: Record<SupportedProvider, string> = {
  OPENAI: "gpt-4o",
  CLAUDE: "claude-3-5-sonnet-latest",
  DEEPSEEK: "deepseek-chat"
};

export class AiService {
  private openAiClient: OpenAI | null = null;
  private anthropicClient: Anthropic | null = null;

  private async resolveApiKey(provider: SupportedProvider, cityId: string): Promise<string | null> {
    switch (provider) {
      case "OPENAI":
        return (
          (await integrationService.getProviderApiKey(IntegrationProvider.OPENAI, cityId)) ?? process.env.OPENAI_API_KEY ?? null
        );
      case "CLAUDE":
        return (
          (await integrationService.getProviderApiKey(IntegrationProvider.ANTHROPIC, cityId)) ??
          process.env.ANTHROPIC_API_KEY ??
          null
        );
      case "DEEPSEEK":
        return (
          (await integrationService.getProviderApiKey(IntegrationProvider.DEEPSEEK, cityId)) ??
          process.env.DEEPSEEK_API_KEY ??
          null
        );
      default:
        return null;
    }
  }

  private async generateWithProvider(provider: SupportedProvider, prompt: string, cityId: string): Promise<string> {
    const apiKey = await this.resolveApiKey(provider, cityId);
    if (!apiKey) throw new AppError(`Missing API key for ${provider}`, 400, "INTEGRATION_MISSING");

    if (provider === "OPENAI") {
      this.openAiClient = this.openAiClient ?? new OpenAI({ apiKey });
      const response = await this.openAiClient.responses.create({
        model: modelByProvider.OPENAI,
        input: prompt
      });
      return response.output_text.trim();
    }

    if (provider === "CLAUDE") {
      this.anthropicClient = this.anthropicClient ?? new Anthropic({ apiKey });
      const response = await this.anthropicClient.messages.create({
        model: modelByProvider.CLAUDE,
        max_tokens: 1800,
        messages: [{ role: "user", content: prompt }]
      });
      const text = response.content.find((part) => part.type === "text");
      return text?.text?.trim() ?? "";
    }

    const deepSeekResponse = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: modelByProvider.DEEPSEEK,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );
    return deepSeekResponse.data.choices?.[0]?.message?.content?.trim() ?? "";
  }

  private confidenceScore(prompt: string, response: string) {
    const coherence = Math.min(1, Math.max(0.4, response.length / 1200));
    const formatting = /(^#|\n- |\n\d+\.)/m.test(response) ? 0.95 : 0.8;
    const completeness = response.length > 120 ? 0.9 : 0.6;
    const overlap = this.tokenOverlap(prompt, response);
    const hallucinationRisk = overlap > 0.2 ? 0.9 : 0.7;
    const confidence = Number(
      ((coherence * 0.25 + formatting * 0.15 + completeness * 0.25 + overlap * 0.15 + hallucinationRisk * 0.2).toFixed(4))
    );
    return Math.max(0, Math.min(1, confidence));
  }

  private tokenOverlap(source: string, generated: string): number {
    const sourceTokens = new Set(source.toLowerCase().split(/\W+/).filter((token) => token.length > 3));
    const generatedTokens = generated.toLowerCase().split(/\W+/).filter((token) => token.length > 3);
    if (!sourceTokens.size || !generatedTokens.length) return 0.4;
    const overlapCount = generatedTokens.filter((token) => sourceTokens.has(token)).length;
    return Math.min(1, overlapCount / generatedTokens.length + 0.25);
  }

  private async applyArticleOutput(articleId: string, type: GenerationType, output: string) {
    const updateData: Record<string, unknown> = {};
    if (type === "SUMMARY") updateData.summary = output;
    if (type === "REWRITE") updateData.content = output;
    if (type === "HEADLINE") updateData.title = output;
    if (type === "SEO") {
      const lines = output.split("\n").filter(Boolean);
      updateData.seoTitle = lines[0]?.replace(/^seo title[:\-]?\s*/i, "") ?? output.slice(0, 70);
      updateData.seoDescription = lines[1]?.replace(/^seo description[:\-]?\s*/i, "") ?? output.slice(0, 160);
    }
    if (type === "NEWSLETTER") updateData.summary = output.slice(0, 400);
    await prisma.article.update({ where: { id: articleId }, data: updateData });
  }

  private async applyConfidenceWorkflow(articleId: string, cityId: string, confidenceScore: number) {
    const moderationMode = await settingService.getBooleanSetting("moderationMode", cityId, false);
    if (moderationMode) {
      await prisma.article.update({
        where: { id: articleId },
        data: { status: ArticleStatus.REVIEW_PENDING, confidenceScore }
      });
      return;
    }

    const autoPublishThreshold = await settingService.getNumberSetting("autoPublishThreshold", cityId, 0.9);
    const reviewThreshold = await settingService.getNumberSetting("reviewThreshold", cityId, 0.7);
    let status: ArticleStatus = ArticleStatus.DRAFT;
    if (confidenceScore >= autoPublishThreshold) status = ArticleStatus.PUBLISHED;
    else if (confidenceScore >= reviewThreshold) status = ArticleStatus.REVIEW_PENDING;

    await prisma.article.update({
      where: { id: articleId },
      data: {
        status,
        confidenceScore,
        publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : null
      }
    });
  }

  async generate(input: GenerateInput) {
    const providerOrder = input.preferredProvider
      ? [input.preferredProvider, ...routingByType[input.type].filter((provider) => provider !== input.preferredProvider)]
      : routingByType[input.type];

    let finalProvider: SupportedProvider | null = null;
    let finalOutput = "";
    let fallbackUsed = false;
    let errorMessage = "";

    for (let index = 0; index < providerOrder.length; index += 1) {
      const provider = providerOrder[index];
      try {
        const output = await this.generateWithProvider(provider, input.prompt, input.cityId);
        if (!output) throw new Error("Empty AI response");
        finalProvider = provider;
        finalOutput = output;
        fallbackUsed = index > 0;
        break;
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : "Unknown provider error";
      }
    }

    if (!finalProvider || !finalOutput) {
      throw new AppError(`AI generation failed across all providers: ${errorMessage}`, 502, "AI_PROVIDER_FAILURE");
    }

    const confidenceScore = this.confidenceScore(input.prompt, finalOutput);

    const generation = await prisma.aiGeneration.create({
      data: {
        cityId: input.cityId,
        articleId: input.articleId,
        generationType: input.type,
        prompt: input.prompt,
        response: finalOutput,
        provider:
          finalProvider === "OPENAI"
            ? AiProvider.OPENAI
            : finalProvider === "CLAUDE"
              ? AiProvider.CLAUDE
              : AiProvider.DEEPSEEK,
        model: modelByProvider[finalProvider],
        confidenceScore,
        fallbackUsed,
        errorMessage: fallbackUsed ? errorMessage : null,
        metadata: {
          providerOrder,
          selectedProvider: finalProvider
        }
      }
    });

    if (input.articleId) {
      await this.applyArticleOutput(input.articleId, input.type, finalOutput);
      await this.applyConfidenceWorkflow(input.articleId, input.cityId, confidenceScore);
      await prisma.article.update({
        where: { id: input.articleId },
        data: {
          aiProvider:
            finalProvider === "OPENAI"
              ? AiProvider.OPENAI
              : finalProvider === "CLAUDE"
                ? AiProvider.CLAUDE
                : AiProvider.DEEPSEEK,
          aiModel: modelByProvider[finalProvider]
        }
      });
    }

    return generation;
  }
}

export const aiService = new AiService();
