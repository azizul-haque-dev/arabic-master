import { sendSuccess } from "@/lib/api-response.js";
import { asyncHandler } from "@/lib/async-handler.js";
import { Request, Response } from "express";
import * as topicService from "./topic.service.js";
import { ListTopicQuery } from "./topic.validation.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as Request & { validatedQuery: ListTopicQuery })
    .validatedQuery;
  const { items, meta } = await topicService.list(query);
  sendSuccess(res, 200, "Topics fetched", { items, meta });
});
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const topic = await topicService.getById(id);
  sendSuccess(res, 200, "Topic fetched", topic);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const topic = await topicService.create(req.body);
  sendSuccess(res, 200, "Topic created", topic);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const topic = await topicService.update(req.body, id);
  sendSuccess(res, 200, "Topic updated", topic);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await topicService.remove(id);
  sendSuccess(res, 200, "Topic deleted");
});
