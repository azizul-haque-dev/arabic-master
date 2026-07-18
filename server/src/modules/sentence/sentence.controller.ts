import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as sentenceService from "./sentence.service.js";
import { ListSentencesQuery } from "./sentence.validation.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as Request & { validatedQuery: ListSentencesQuery })
    .validatedQuery;
  const { items, meta } = await sentenceService.list(query);
  sendSuccess(res, 200, "Sentences fetched", items, meta);
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
    const result = await sentenceService.processNewSentence(req.body.text);
    sendSuccess(res, 202, "Sentence queued for AI processing", result);
  },
);
