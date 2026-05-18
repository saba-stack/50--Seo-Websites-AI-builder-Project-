import { IntegrationProvider, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export class IntegrationRepository {
  list(cityId?: string) {
    return prisma.integration.findMany({
      where: cityId ? { OR: [{ cityId }, { cityId: null }] } : undefined,
      orderBy: { provider: "asc" }
    });
  }

  async upsert(data: {
    cityId?: string | null;
    provider: IntegrationProvider;
    encryptedApiKey: string;
    config?: Prisma.InputJsonValue;
    isEnabled: boolean;
  }) {
    const existing = await prisma.integration.findFirst({
      where: {
        provider: data.provider,
        cityId: data.cityId ?? null
      }
    });

    if (existing) {
      return prisma.integration.update({
        where: { id: existing.id },
        data: {
          encryptedApiKey: data.encryptedApiKey,
          config: data.config,
          isEnabled: data.isEnabled,
          lastValidatedAt: new Date()
        }
      });
    }

    return prisma.integration.create({
      data: {
        cityId: data.cityId ?? null,
        provider: data.provider,
        encryptedApiKey: data.encryptedApiKey,
        config: data.config,
        isEnabled: data.isEnabled,
        lastValidatedAt: new Date()
      }
    });
  }

  getProvider(provider: IntegrationProvider, cityId?: string) {
    return prisma.integration.findFirst({
      where: {
        provider,
        isEnabled: true,
        OR: cityId ? [{ cityId }, { cityId: null }] : [{ cityId: null }]
      },
      orderBy: { cityId: "desc" }
    });
  }
}

export const integrationRepository = new IntegrationRepository();
