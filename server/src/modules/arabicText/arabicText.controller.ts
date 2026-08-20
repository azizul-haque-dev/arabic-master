import { Request, Response } from "express";
import { sendSuccess } from "@/lib/api-response.js";
import { asyncHandler } from "@/lib/async-handler.js";
import { translateWord } from "../ai/generateContent.js";
import * as arabicTextService from "./arabicText.service.js";
import { ListArabicTextsQuery } from "./arabicText.types.js";

const arabicRegex = /^[\u0600-\u06FF\s]+$/;

// Same "translate if not Arabic" preprocessing already used by
// word/sentence/conversation-line controllers before handing text to AI.
async function normalizeText(req: Request) {
    if (req.body.text && !arabicRegex.test(req.body.text)) {
        req.body.text = await translateWord(req.body.text);
    }
}

export const list = asyncHandler(async (req: Request, res: Response) => {
    const query = (req as Request & { validatedQuery: ListArabicTextsQuery })
        .validatedQuery;
    const { items, meta } = await arabicTextService.list(query);
    sendSuccess(res, 200, "Arabic texts fetched", { items, meta });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
    const arabicText = await arabicTextService.getById(req.params.id as string);
    sendSuccess(res, 200, "Arabic text fetched", arabicText);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
    await normalizeText(req);
    const arabicText = await arabicTextService.create(req.body);
    sendSuccess(res, 201, "Arabic text created", arabicText);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
    await normalizeText(req);
    const arabicText = await arabicTextService.update(
        req.params.id as string,
        req.body,
    );
    sendSuccess(res, 200, "Arabic text updated", arabicText);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
    await arabicTextService.remove(req.params.id as string);
    sendSuccess(res, 200, "Arabic text deleted");
});

// POST /arabic-texts/ai - queues AI enrichment, returns 202 immediately.
export const generate = asyncHandler(async (req: Request, res: Response) => {
    await normalizeText(req);
    const result = await arabicTextService.generate(req.body);
    sendSuccess(res, 202, "Arabic text queued for AI processing", result);
});