import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as userService from "./user.service.js";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(req.user!.id);
  sendSuccess(res, 200, "Profile fetched", user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.id, req.body);
  sendSuccess(res, 200, "Profile updated", user);
});
