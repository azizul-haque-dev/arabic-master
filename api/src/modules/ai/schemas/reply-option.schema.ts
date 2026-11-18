import { z } from 'zod';

export const replyOptionSchema = z.strictObject({
  arabicText: z.string().trim().min(1),
  pronunciationBn: z.string().trim().min(1),
  pronunciationEn: z.string().trim().min(1),
  meaningBn: z.string().trim().min(1),
  meaningEn: z.string().trim().min(1),
});

export type ReplyOption = z.infer<typeof replyOptionSchema>;
