import { ArticleStatus, ModerationActionType, Role } from "@prisma/client";
import { moderationRepository } from "../repositories/moderationRepository";
import { articleRepository } from "../repositories/articleRepository";
import { AppError } from "../utils/appError";

export class ModerationService {
  async applyAction(input: {
    articleId: string;
    userId: string;
    action: ModerationActionType;
    notes?: string;
    content?: string;
  }) {
    const article = await articleRepository.findById(input.articleId);
    if (!article) throw new AppError("Article not found", 404, "ARTICLE_NOT_FOUND");

    let status = article.status;
    let afterContent = article.content;

    switch (input.action) {
      case ModerationActionType.APPROVE:
        status = ArticleStatus.APPROVED;
        break;
      case ModerationActionType.REJECT:
        status = ArticleStatus.REJECTED;
        break;
      case ModerationActionType.EDIT:
        status = ArticleStatus.REVIEW_PENDING;
        afterContent = input.content ?? article.content;
        break;
      case ModerationActionType.ESCALATE:
        status = ArticleStatus.REVIEW_PENDING;
        break;
      default:
        status = ArticleStatus.REVIEW_PENDING;
    }

    await articleRepository.update(input.articleId, { status, content: afterContent });
    return moderationRepository.createAction({
      articleId: input.articleId,
      userId: input.userId,
      action: input.action,
      notes: input.notes,
      beforeContent: article.content,
      afterContent
    });
  }

  reviewQueue(cityId: string, skip: number, limit: number) {
    return moderationRepository.reviewQueue(cityId, skip, limit);
  }
}

export const moderationService = new ModerationService();
