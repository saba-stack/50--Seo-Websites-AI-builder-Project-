import { IntegrationProvider, Prisma } from "@prisma/client";
import { integrationRepository } from "../repositories/integrationRepository";
import { decrypt, encrypt } from "../utils/crypto";

export class IntegrationService {
  async list(cityId?: string) {
    const rows = await integrationRepository.list(cityId);
    return rows.map((row) => ({
      ...row,
      encryptedApiKey: undefined,
      hasApiKey: Boolean(row.encryptedApiKey)
    }));
  }

  async upsert(input: {
    cityId?: string;
    provider: IntegrationProvider;
    apiKey: string;
    isEnabled: boolean;
    config?: Prisma.InputJsonValue;
  }) {
    return integrationRepository.upsert({
      cityId: input.cityId,
      provider: input.provider,
      encryptedApiKey: encrypt(input.apiKey),
      isEnabled: input.isEnabled,
      config: input.config
    });
  }

  async getProviderApiKey(provider: IntegrationProvider, cityId?: string): Promise<string | null> {
    const integration = await integrationRepository.getProvider(provider, cityId);
    if (!integration || !integration.encryptedApiKey) return null;
    return decrypt(integration.encryptedApiKey);
  }
}

export const integrationService = new IntegrationService();
