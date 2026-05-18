import { Prisma, SettingScope } from "@prisma/client";
import { settingRepository } from "../repositories/settingRepository";

export class SettingService {
  upsert(input: { cityId?: string; scope: SettingScope; key: string; value: Prisma.InputJsonValue }) {
    return settingRepository.upsert({
      cityId: input.cityId,
      scope: input.scope,
      key: input.key,
      value: input.value
    });
  }

  list(cityId?: string) {
    return settingRepository.list(cityId);
  }

  async getBooleanSetting(key: string, cityId?: string, fallback = false) {
    const setting = await settingRepository.getByKey(key, cityId);
    return typeof setting?.value === "boolean" ? setting.value : fallback;
  }

  async getNumberSetting(key: string, cityId?: string, fallback = 0) {
    const setting = await settingRepository.getByKey(key, cityId);
    return typeof setting?.value === "number" ? setting.value : fallback;
  }
}

export const settingService = new SettingService();
