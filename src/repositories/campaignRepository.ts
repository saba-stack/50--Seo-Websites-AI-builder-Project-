import { CampaignStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export class CampaignRepository {
  create(data: Prisma.EmailCampaignUncheckedCreateInput) {
    return prisma.emailCampaign.create({ data });
  }

  list(cityId: string, skip: number, take: number, sortOrder: "asc" | "desc") {
    return Promise.all([
      prisma.emailCampaign.findMany({
        where: { cityId },
        skip,
        take,
        orderBy: { createdAt: sortOrder }
      }),
      prisma.emailCampaign.count({ where: { cityId } })
    ]);
  }

  getById(id: string) {
    return prisma.emailCampaign.findUnique({ where: { id } });
  }

  markSending(id: string) {
    return prisma.emailCampaign.update({ where: { id }, data: { status: CampaignStatus.SENDING } });
  }

  markSent(id: string, deliveredCount: number) {
    return prisma.emailCampaign.update({
      where: { id },
      data: { status: CampaignStatus.SENT, deliveredCount, sentAt: new Date() }
    });
  }

  markFailed(id: string) {
    return prisma.emailCampaign.update({
      where: { id },
      data: { status: CampaignStatus.FAILED }
    });
  }

  createEvent(data: Prisma.CampaignEventUncheckedCreateInput) {
    return prisma.campaignEvent.create({ data });
  }
}

export const campaignRepository = new CampaignRepository();
