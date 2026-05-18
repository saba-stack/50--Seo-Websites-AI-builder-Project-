import axios from "axios";
import { CampaignStatus, EventType, IntegrationProvider } from "@prisma/client";
import { campaignRepository } from "../repositories/campaignRepository";
import { subscriberService } from "./subscriberService";
import { integrationService } from "./integrationService";
import { AppError } from "../utils/appError";

export class EmailService {
  async createCampaign(input: {
    cityId: string;
    title: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    type: "NEWSLETTER" | "PROMOTIONAL";
    provider?: "SALESFORCE" | "GMASS";
    scheduledAt?: Date;
  }) {
    return campaignRepository.create({
      cityId: input.cityId,
      title: input.title,
      subject: input.subject,
      htmlContent: input.htmlContent,
      textContent: input.textContent,
      type: input.type,
      provider: input.provider ? IntegrationProvider[input.provider] : undefined,
      status: input.scheduledAt ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT,
      scheduledAt: input.scheduledAt
    });
  }

  list(cityId: string, skip: number, limit: number, sortOrder: "asc" | "desc") {
    return campaignRepository.list(cityId, skip, limit, sortOrder);
  }

  private async sendWithSalesforce(input: { cityId: string; subject: string; htmlContent: string; recipients: string[] }) {
    const apiKey = await integrationService.getProviderApiKey(IntegrationProvider.SALESFORCE, input.cityId);
    if (!apiKey || !process.env.SALESFORCE_BASE_URL) {
      throw new AppError("Salesforce integration not configured", 400, "INTEGRATION_MISSING");
    }

    await axios.post(
      `${process.env.SALESFORCE_BASE_URL}/campaigns/send`,
      {
        subject: input.subject,
        htmlContent: input.htmlContent,
        recipients: input.recipients
      },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
  }

  private async sendWithGmass(input: { cityId: string; subject: string; htmlContent: string; recipients: string[] }) {
    const apiKey = await integrationService.getProviderApiKey(IntegrationProvider.GMASS, input.cityId);
    if (!apiKey) throw new AppError("GMass integration not configured", 400, "INTEGRATION_MISSING");

    await axios.post(
      "https://api.gmass.co/v1/campaigns/send",
      {
        subject: input.subject,
        html: input.htmlContent,
        recipients: input.recipients
      },
      { headers: { "x-api-key": apiKey } }
    );
  }

  async sendCampaign(campaignId: string) {
    const campaign = await campaignRepository.getById(campaignId);
    if (!campaign) throw new AppError("Campaign not found", 404, "CAMPAIGN_NOT_FOUND");

    await campaignRepository.markSending(campaign.id);
    const subscribers = await subscriberService.activeByCity(campaign.cityId);
    const recipients = subscribers.map((subscriber) => subscriber.email);

    if (!recipients.length) {
      await campaignRepository.markFailed(campaign.id);
      throw new AppError("No active subscribers in city", 400, "NO_RECIPIENTS");
    }

    const provider = campaign.provider ?? IntegrationProvider.SALESFORCE;

    try {
      if (provider === IntegrationProvider.GMASS) {
        await this.sendWithGmass({
          cityId: campaign.cityId,
          subject: campaign.subject,
          htmlContent: campaign.htmlContent,
          recipients
        });
      } else {
        await this.sendWithSalesforce({
          cityId: campaign.cityId,
          subject: campaign.subject,
          htmlContent: campaign.htmlContent,
          recipients
        });
      }

      await campaignRepository.markSent(campaign.id, recipients.length);
      await campaignRepository.createEvent({
        campaignId: campaign.id,
        eventType: EventType.ENGAGEMENT,
        metadata: { deliveredCount: recipients.length }
      });
    } catch (error) {
      await campaignRepository.markFailed(campaign.id);
      throw error;
    }
  }
}

export const emailService = new EmailService();
