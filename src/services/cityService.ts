import { cityRepository } from "../repositories/cityRepository";
import { AppError } from "../utils/appError";

export class CityService {
  create(input: { name: string; slug: string; state: string; country: string; timezone: string }) {
    return cityRepository.create(input);
  }

  list() {
    return cityRepository.list();
  }

  async get(id: string) {
    const city = await cityRepository.getById(id);
    if (!city) throw new AppError("City not found", 404, "CITY_NOT_FOUND");
    return city;
  }
}

export const cityService = new CityService();
