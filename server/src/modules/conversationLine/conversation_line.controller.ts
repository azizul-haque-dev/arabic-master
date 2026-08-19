import { sendSuccess } from "@/lib/api-response.js";
import { asyncHandler } from "@/lib/async-handler.js";
import { Request, Response } from "express";
import { translateWord } from "../ai/generateContent.js";
import * as conversationLineService from "./conversation_line.service.js";
import { ListConversationLinesQuery } from "./conversation_line.validation.js";

const arabicRegex = /^[\u0600-\u06FF\s]+$/;

// Same "translate if not Arabic" preprocessing sentence.controller.ts and
// word.controller.ts already do before handing text off to the AI flow.
async function normalizeText(req: Request) {
  if (req.body.text && !arabicRegex.test(req.body.text)) {
    req.body.text = await translateWord(req.body.text);
  }
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = (
    req as Request & { validatedQuery: ListConversationLinesQuery }
  ).validatedQuery;
  const { items, meta } = await conversationLineService.list(query);
  sendSuccess(res, 200, "Conversation lines fetched", { items, meta });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const line = await conversationLineService.getById(req.params.id as string);
  sendSuccess(res, 200, "Conversation line fetched", line);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  await normalizeText(req);
  const line = await conversationLineService.create(req.body);
  sendSuccess(res, 201, "Conversation line created", line);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  await normalizeText(req);
  const line = await conversationLineService.update(
    req.params.id as string,
    req.body,
  );
  sendSuccess(res, 200, "Conversation line updated", line);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await conversationLineService.remove(req.params.id as string);
  sendSuccess(res, 200, "Conversation line deleted");
});
