import { Request, Response } from "express";
import { sendSuccess } from "@/lib/api-response.js";
import { asyncHandler } from "@/lib/async-handler.js";
import { translateWord } from "../ai/generateContent.js";
import * as wordAiService from "./word.ai.service.js";
import * as wordService from "./word.service.js";
import { ListWordsQuery } from "./word.validation.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as Request & { validatedQuery: ListWordsQuery })
    .validatedQuery;
  const { items, meta } = await wordService.list(query);
  sendSuccess(res, 200, "Words fetched", { items, meta });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const word = await wordService.getById(req.params.id as string);
  sendSuccess(res, 200, "Word fetched", word);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const word = await wordService.create(req.body);
  sendSuccess(res, 201, "Word created", word);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const word = await wordService.update(req.params.id as string, req.body);
  sendSuccess(res, 200, "Word updated", word);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await wordService.remove(req.params.id as string);
  sendSuccess(res, 200, "Word deleted");
});

// NOT part of this CRUD rewrite - kept as-is, will break the build until
// word.ai.service.ts's `createPendingWord` drops its `status: Status.DRAFT`
// field (Word no longer has a status column).
export const processWord = asyncHandler(async (req: Request, res: Response) => {
  const arabicRegex = /^[\u0600-\u06FF\s]+$/;
  let text = req.body.text;
  if (!arabicRegex.test(req.body.text)) {
    text = await translateWord(text);
  }

  const word = await wordAiService.processNewWord(text);
  sendSuccess(res, 201, "Word generated", word);
});