import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export class SubscriberRepository {
  create(data: Prisma.SubscriberUncheckedCreateInput) {
    return prisma.subscriber.create({ data });
  }

  list(cityId: string, skip: number, take: number, sortOrder: "asc" | "desc") {
    return Promise.all([
      prisma.subscriber.findMany({
        where: { cityId },
        skip,
        take,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.subscriber.count({ where: { cityId } })
    ]);
  }

  deactivate(id: string) {
    return prisma.subscriber.update({
      where: { id },
      data: { isActive: false }
    });
  }

  activeByCity(cityId: string) {
    return prisma.subscriber.findMany({ where: { cityId, isActive: true } });
  }
}

export const subscriberRepository = new SubscriberRepository();
