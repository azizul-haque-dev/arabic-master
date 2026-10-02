import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as tables from './schema.js';

import { getTableApi, tableMap } from './table-helpers.js';

@Injectable()
export class DatabaseService {
  public readonly pool: pg.Pool;
  public readonly db: any;

  public readonly user = getTableApi(tableMap.user, null as any);
  public readonly authIdentity = getTableApi(tableMap.authIdentity, null as any);
  public readonly session = getTableApi(tableMap.session, null as any);
  public readonly refreshToken = getTableApi(tableMap.refreshToken, null as any);
  public readonly passwordResetToken = getTableApi(tableMap.passwordResetToken, null as any);
  public readonly emailVerificationToken = getTableApi(tableMap.emailVerificationToken, null as any);
  public readonly userProfile = getTableApi(tableMap.userProfile, null as any);
  public readonly userProgress = getTableApi(tableMap.userProgress, null as any);
  public readonly learningActivity = getTableApi(tableMap.learningActivity, null as any);
  public readonly guestUser = getTableApi(tableMap.guestUser, null as any);
  public readonly subscription = getTableApi(tableMap.subscription, null as any);
  public readonly transaction = getTableApi(tableMap.transaction, null as any);
  public readonly arabicEntity = getTableApi(tableMap.arabicEntity, null as any);
  public readonly word = getTableApi(tableMap.word, null as any);
  public readonly grammaticalVariant = getTableApi(tableMap.grammaticalVariant, null as any);
  public readonly sentenceWord = getTableApi(tableMap.sentenceWord, null as any);
  public readonly sentence = getTableApi(tableMap.sentence, null as any);
  public readonly conversation = getTableApi(tableMap.conversation, null as any);
  public readonly conversationTurn = getTableApi(tableMap.conversationTurn, null as any);
  public readonly course = getTableApi(tableMap.course, null as any);
  public readonly section = getTableApi(tableMap.section, null as any);
  public readonly lesson = getTableApi(tableMap.lesson, null as any);
  public readonly lessonContentItem = getTableApi(tableMap.lessonContentItem, null as any);
  public readonly contentCompletion = getTableApi(tableMap.contentCompletion, null as any);
  public readonly lessonProgress = getTableApi(tableMap.lessonProgress, null as any);

  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');
    this.pool = new pg.Pool({ connectionString });
    this.db = drizzle(this.pool, { schema: tables });

    this.user = getTableApi(tableMap.user, this.db);
    this.authIdentity = getTableApi(tableMap.authIdentity, this.db);
    this.session = getTableApi(tableMap.session, this.db);
    this.refreshToken = getTableApi(tableMap.refreshToken, this.db);
    this.passwordResetToken = getTableApi(tableMap.passwordResetToken, this.db);
    this.emailVerificationToken = getTableApi(tableMap.emailVerificationToken, this.db);
    this.userProfile = getTableApi(tableMap.userProfile, this.db);
    this.userProgress = getTableApi(tableMap.userProgress, this.db);
    this.learningActivity = getTableApi(tableMap.learningActivity, this.db);
    this.guestUser = getTableApi(tableMap.guestUser, this.db);
    this.subscription = getTableApi(tableMap.subscription, this.db);
    this.transaction = getTableApi(tableMap.transaction, this.db);
    this.arabicEntity = getTableApi(tableMap.arabicEntity, this.db);
    this.word = getTableApi(tableMap.word, this.db);
    this.grammaticalVariant = getTableApi(tableMap.grammaticalVariant, this.db);
    this.sentenceWord = getTableApi(tableMap.sentenceWord, this.db);
    this.sentence = getTableApi(tableMap.sentence, this.db);
    this.conversation = getTableApi(tableMap.conversation, this.db);
    this.conversationTurn = getTableApi(tableMap.conversationTurn, this.db);
    this.course = getTableApi(tableMap.course, this.db);
    this.section = getTableApi(tableMap.section, this.db);
    this.lesson = getTableApi(tableMap.lesson, this.db);
    this.lessonContentItem = getTableApi(tableMap.lessonContentItem, this.db);
    this.contentCompletion = getTableApi(tableMap.contentCompletion, this.db);
    this.lessonProgress = getTableApi(tableMap.lessonProgress, this.db);
  }

  async onModuleInit(): Promise<void> {
    await this.pool.query('SELECT 1');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async $transaction<T>(callback: (tx: DatabaseService) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx: any) => {
      const tableApis = Object.fromEntries(
        Object.entries(tableMap).map(([name, table]) => [name, getTableApi(table, tx)]),
      );
      const transactionContext = Object.assign(
        Object.create(this),
        { db: tx },
        tableApis,
      ) as DatabaseService;

      return callback(transactionContext);
    });
  }
}
