import { prisma } from "../config/prisma";

export class CityRepository {
  create(data: { name: string; slug: string; state: string; country: string; timezone: string }) {
    return prisma.city.create({ data });
  }

  list() {
    return prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });
  }

  getById(id: string) {
    return prisma.city.findUnique({ where: { id } });
  }
}

export const cityRepository = new CityRepository();
