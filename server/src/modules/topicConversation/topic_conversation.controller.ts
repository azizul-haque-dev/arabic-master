import { sendSuccess } from "@/lib/api-response.js";
import { asyncHandler } from "@/lib/async-handler.js";
import { Request, Response } from "express";
import * as topicConversationService from "./topic_conversation.service.js";
import { ListTopicConversationsQuery } from "./topic_conversation.validation.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = (
    req as Request & { validatedQuery: ListTopicConversationsQuery }
  ).validatedQuery;
  const { items, meta } = await topicConversationService.list(query);
  sendSuccess(res, 200, "Topic conversations fetched", { items, meta });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const topicConversation = await topicConversationService.getById(
    req.params.id as string,
  );
  sendSuccess(res, 200, "Topic conversation fetched", topicConversation);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const topicConversation = await topicConversationService.create(req.body);
  sendSuccess(res, 201, "Topic conversation created", topicConversation);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const topicConversation = await topicConversationService.update(
    req.params.id as string,
    req.body,
  );
  sendSuccess(res, 200, "Topic conversation updated", topicConversation);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await topicConversationService.remove(req.params.id as string);
  sendSuccess(res, 200, "Topic conversation deleted");
});
