import {
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import {
  paymentProviderEnum,
  subscriptionStatusEnum,
  transactionStatusEnum,
} from '../enums.js';

export const subscription = pgTable(
  'Subscription',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    plan: text('plan').notNull(),
    status: subscriptionStatusEnum('status').notNull(),
    startedAt: timestamp('startedAt').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    provider: paymentProviderEnum('provider').notNull(),
    transactionId: text('transactionId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('Subscription_provider_transactionId_key').on(
      table.provider,
      table.transactionId,
    ),
    index('Subscription_userId_status_idx').on(table.userId, table.status),
  ],
);
export const transaction = pgTable(
  'Transaction',
  {
    id: text('id').primaryKey(),
    userId: text('userId').notNull(),
    subscriptionId: text('subscriptionId'),
    provider: paymentProviderEnum('provider').notNull(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('BDT').notNull(),
    status: transactionStatusEnum('status').notNull(),
    providerTransactionId: text('providerTransactionId').notNull().unique(),
    rawPayload: jsonb('rawPayload'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  (table) => [
    index('Transaction_userId_status_idx').on(table.userId, table.status),
  ],
);
