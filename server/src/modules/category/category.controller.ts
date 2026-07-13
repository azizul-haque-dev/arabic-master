import { sendSuccess } from "@/utils/api-response.js";
import { asyncHandler } from "@/utils/async-handler.js";
import { Request, Response } from "express";
import * as categoryService from "./category.service.js";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.list();
  sendSuccess(res, 200, "Categories fetched", categories);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getById(req.params.id as string);
  sendSuccess(res, 200, "Category fetched", category);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.create(req.body);
  sendSuccess(res, 201, "Category created", category);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.update(
    req.params.id as string,
    req.body,
  );
  sendSuccess(res, 200, "Category updated", category);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.remove(req.params.id as string);
  sendSuccess(res, 200, "Category deleted");
});
