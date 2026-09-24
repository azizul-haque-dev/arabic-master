import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import { AiService } from '../ai.service.js';
import { WORD_INCLUDE } from '../../word/word.constants.js';

@Injectable()
export class AiWordService {
    private readonly logger = new Logger(AiWordService.name);

    constructor(
        private readonly prisma: PrismaService,

        private readonly aiService: AiService,
    ) { }

    async createWordViaAi(input: string) {
        const result = await this.aiService.generateContent(input);
        
        // Use crypto for unique keys if needed, or simple timestamps
        const uniqueId = Date.now().toString();

        const data = {
            wordKey: `word-${uniqueId}`,
            category: 'UNCATEGORIZED', // Provide a default category
            meaningEn: result.meaningEn,
            meaningBn: result.meaningBn,
            whenToUseEn: result.whenToUseEn,
            whenToUseBn: result.whenToUseBn,
            pronunciationEn: result.pronunciationEn,
            pronunciationBn: result.pronunciationBn,
            feminineEn: result.feminineEn,
            feminineBn: result.feminineBn,
            noteEn: result.noteEn || null,
            noteBn: result.noteBn || null,
            entity: {
                create: {
                    entityKey: `entity-${uniqueId}`,
                    arabicText: result.text,
                    normalizedText: result.text.trim(), // Provide normalized text
                    pronunciationBangla: result.pronunciationBn,
                    pronunciationEnglish: result.pronunciationEn,
                },
            },
        };

        return this.prisma.word.create({ data, include: WORD_INCLUDE });
        // No try/catch here on purpose: a service throwing a raw error is fine in Nest —
        // wrap it in a global exception filter if you want consistent error shapes,
        // don't catch-log-rethrow at every call site.
    }
}