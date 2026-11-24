import type { Request, Response } from 'express';
import { ok } from '../../common/http/response.js';
import { queryOf } from '../../common/middleware/validate.js';
import type { ListConversationQuery } from '../conversations/conversation.schemas.js';
import type { ListCourseQuery } from '../curriculum/courses/course.schemas.js';
import type { ListSentenceQuery } from '../sentence/sentence.schemas.js';
import type { ListWordQuery } from '../words/word.schemas.js';
import { LearnerService } from './learner.service.js';

export const LearnerController = {
  overview: async (req: Request, res: Response) => {
    ok(res, await LearnerService.getOverview(req.auth!.userId));
  },

  words: async (req: Request, res: Response) => {
    ok(
      res,
      await LearnerService.listPublishedWords(queryOf<ListWordQuery>(req)),
    );
  },

  sentences: async (req: Request, res: Response) => {
    ok(
      res,
      await LearnerService.listPublishedSentences(
        queryOf<ListSentenceQuery>(req),
      ),
    );
  },

  conversations: async (req: Request, res: Response) => {
    ok(
      res,
      await LearnerService.listPublishedConversations(
        queryOf<ListConversationQuery>(req),
      ),
    );
  },

  courses: async (req: Request, res: Response) => {
    ok(
      res,
      await LearnerService.listPublishedCourses(queryOf<ListCourseQuery>(req)),
    );
  },
};
