import { Prisma, SettingScope } from "@prisma/client";
import { prisma } from "../config/prisma";

export class SettingRepository {
  async upsert(data: { cityId?: string | null; scope: SettingScope; key: string; value: Prisma.InputJsonValue }) {
    const existing = await prisma.setting.findFirst({
      where: {
        cityId: data.cityId ?? null,
        key: data.key
      }
    });

    if (existing) {
      return prisma.setting.update({
        where: { id: existing.id },
        data: { value: data.value, scope: data.scope }
      });
    }

    return prisma.setting.create({
      data: { cityId: data.cityId ?? null, scope: data.scope, key: data.key, value: data.value }
    });
  }

  getByKey(key: string, cityId?: string) {
    return prisma.setting.findFirst({
      where: {
        key,
        OR: cityId ? [{ cityId }, { cityId: null }] : [{ cityId: null }]
      },
      orderBy: { cityId: "desc" }
    });
  }

  list(cityId?: string) {
    return prisma.setting.findMany({
      where: cityId ? { OR: [{ cityId }, { cityId: null }] } : undefined,
      orderBy: { key: "asc" }
    });
  }
}

export const settingRepository = new SettingRepository();
