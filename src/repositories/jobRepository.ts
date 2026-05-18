import { JobStatus, JobType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export class JobRepository {
  create(type: JobType, payload: Prisma.InputJsonValue) {
    return prisma.jobRun.create({
      data: { type, status: JobStatus.QUEUED, payload }
    });
  }

  updateStatus(id: string, status: JobStatus, fields?: Partial<{ error: string; attempts: number }>) {
    const finishedAt = status === JobStatus.COMPLETED || status === JobStatus.FAILED ? new Date() : undefined;
    return prisma.jobRun.update({
      where: { id },
      data: {
        status,
        startedAt: status === JobStatus.RUNNING ? new Date() : undefined,
        finishedAt,
        error: fields?.error,
        attempts: fields?.attempts
      }
    });
  }
}

export const jobRepository = new JobRepository();
