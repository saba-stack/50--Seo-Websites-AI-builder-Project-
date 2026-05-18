import { subscriberRepository } from "../repositories/subscriberRepository";
import { AppError } from "../utils/appError";

export class SubscriberService {
  create(input: { cityId: string; email: string; source?: string; tags?: string[] }) {
    return subscriberRepository.create({
      cityId: input.cityId,
      email: input.email,
      source: input.source,
      tags: input.tags ?? []
    });
  }

  list(input: { cityId: string; skip: number; limit: number; sortOrder: "asc" | "desc" }) {
    return subscriberRepository.list(input.cityId, input.skip, input.limit, input.sortOrder);
  }

  async unsubscribe(id: string) {
    try {
      return await subscriberRepository.deactivate(id);
    } catch {
      throw new AppError("Subscriber not found", 404, "SUBSCRIBER_NOT_FOUND");
    }
  }

  activeByCity(cityId: string) {
    return subscriberRepository.activeByCity(cityId);
  }
}

export const subscriberService = new SubscriberService();
