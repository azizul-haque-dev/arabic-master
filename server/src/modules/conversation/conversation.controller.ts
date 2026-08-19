import { sendSuccess } from "@/lib/api-response.js";
import { asyncHandler } from "@/lib/async-handler.js";
import { Request, Response } from "express";
import * as conversationService from "./conversation.service.js";
import { ListConversationsQuery } from "./conversation.validation.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as Request & { validatedQuery: ListConversationsQuery })
    .validatedQuery;
  const { items, meta } = await conversationService.list(query);
  sendSuccess(res, 200, "Conversations fetched", { items, meta });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await conversationService.getById(
    req.params.id as string,
  );
  sendSuccess(res, 200, "Conversation fetched", conversation);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await conversationService.create(req.body);
  sendSuccess(res, 201, "Conversation created", conversation);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const conversation = await conversationService.update(
    req.params.id as string,
    req.body,
  );
  sendSuccess(res, 200, "Conversation updated", conversation);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await conversationService.remove(req.params.id as string);
  sendSuccess(res, 200, "Conversation deleted");
});
