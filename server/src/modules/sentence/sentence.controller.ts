import { Request, Response } from "express";
import { sendSuccess } from "@/lib/api-response.js";
import { asyncHandler } from "@/lib/async-handler.js";
import { translateWord } from "../ai/generateContent.js";
import * as sentenceService from "./sentence.service.js";
import { ListSentencesQuery } from "./sentence.validation.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as Request & { validatedQuery: ListSentencesQuery })
    .validatedQuery;
  const { items, meta } = await sentenceService.list(query);
  sendSuccess(res, 200, "Sentences fetched", { items, meta });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const sentence = await sentenceService.getById(req.params.id as string);
  sendSuccess(res, 200, "Sentence fetched", sentence);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const sentence = await sentenceService.create(req.body);
  sendSuccess(res, 201, "Sentence created", sentence);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const sentence = await sentenceService.update(
    req.params.id as string,
    req.body,
  );
  sendSuccess(res, 200, "Sentence updated", sentence);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await sentenceService.remove(req.params.id as string);
  sendSuccess(res, 200, "Sentence deleted");
});
export const processSentence = asyncHandler(
  async (req: Request, res: Response) => {
    const arabicRegex = /^[\u0600-\u06FF\s]+$/;
    let text = req.body.text;
    if (!arabicRegex.test(req.body.text)) {
      text = await translateWord(text);
    }
    const result = await sentenceService.processNewSentence(text);
    sendSuccess(res, 202, "Sentence queued for AI processing", result);
  },
);
