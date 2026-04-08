import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";

// ─── Auth tables (Better Auth managed) ────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_userId_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("account_userId_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// ─── API Keys ─────────────────────────────────────────────────────────────────

export const apiKey = pgTable(
  "api_key",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull().unique(),  // SHA-256 of raw key — never store raw
    keyPrefix: text("key_prefix").notNull(),        // first 16 chars, safe to display
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),             // null = never expires
    createdAt: timestamp("created_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),             // null = active
  },
  (t) => [
    index("api_key_userId_idx").on(t.userId),
    index("api_key_keyHash_idx").on(t.keyHash),
  ],
);

// ─── Domains ──────────────────────────────────────────────────────────────────

export const domain = pgTable(
  "domain",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    region: text("region").notNull().default("us-east-1"),
    // pending | verified | failed
    status: text("status").notNull().default("pending"),
    sesIdentityArn: text("ses_identity_arn"),
    // pending | success | failed | temporary_failure
    dkimStatus: text("dkim_status").notNull().default("pending"),
    dkimTokens: jsonb("dkim_tokens").$type<string[]>(),
    dkimSigningEnabled: boolean("dkim_signing_enabled").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("domain_userId_idx").on(t.userId),
    index("domain_domain_idx").on(t.domain),
  ],
);

// ─── Emails ───────────────────────────────────────────────────────────────────

export const email = pgTable(
  "email",
  {
    id: text("id").primaryKey(),           // em_ + nanoid(22)
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    apiKeyId: text("api_key_id")
      .references(() => apiKey.id, { onDelete: "set null" }),
    from: text("from").notNull(),
    to: jsonb("to").notNull().$type<string[]>(),
    cc: jsonb("cc").$type<string[]>(),
    bcc: jsonb("bcc").$type<string[]>(),
    replyTo: jsonb("reply_to").$type<string[]>(),
    subject: text("subject").notNull(),
    html: text("html"),
    text: text("text"),
    headers: jsonb("headers").$type<Record<string, string>>(),
    tags: jsonb("tags").$type<Record<string, string>>(),
    // queued | sent | delivered | bounced | complained | failed
    status: text("status").notNull().default("queued"),
    sesMessageId: text("ses_message_id"),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    bouncedAt: timestamp("bounced_at"),
    complainedAt: timestamp("complained_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("email_userId_idx").on(t.userId),
    index("email_status_idx").on(t.status),
    index("email_sesMessageId_idx").on(t.sesMessageId),
    index("email_createdAt_idx").on(t.createdAt),
  ],
);

// ─── Webhooks ─────────────────────────────────────────────────────────────────

export const webhook = pgTable(
  "webhook",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    name: text("name"),
    // plaintext 32-byte hex — shown once, used for HMAC-SHA256 payload signing
    secret: text("secret").notNull(),
    // string[] — empty = receive all events
    events: jsonb("events").notNull().$type<string[]>().default([]),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("webhook_userId_idx").on(t.userId)],
);

// ─── Webhook Deliveries ───────────────────────────────────────────────────────

export const webhookDelivery = pgTable(
  "webhook_delivery",
  {
    id: text("id").primaryKey(),
    webhookId: text("webhook_id")
      .notNull()
      .references(() => webhook.id, { onDelete: "cascade" }),
    emailId: text("email_id")
      .references(() => email.id, { onDelete: "set null" }),
    event: text("event").notNull(),
    payload: jsonb("payload").notNull(),
    // pending | success | failed
    status: text("status").notNull().default("pending"),
    responseStatus: integer("response_status"),
    responseBody: text("response_body"),     // first 1000 chars
    attempt: integer("attempt").notNull().default(1),
    nextRetryAt: timestamp("next_retry_at"),
    deliveredAt: timestamp("delivered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("webhook_delivery_webhookId_idx").on(t.webhookId),
    index("webhook_delivery_emailId_idx").on(t.emailId),
    index("webhook_delivery_status_idx").on(t.status),
    index("webhook_delivery_nextRetryAt_idx").on(t.nextRetryAt),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  apiKeys: many(apiKey),
  domains: many(domain),
  emails: many(email),
  webhooks: many(webhook),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const apiKeyRelations = relations(apiKey, ({ one, many }) => ({
  user: one(user, { fields: [apiKey.userId], references: [user.id] }),
  emails: many(email),
}));

export const domainRelations = relations(domain, ({ one }) => ({
  user: one(user, { fields: [domain.userId], references: [user.id] }),
}));

export const emailRelations = relations(email, ({ one, many }) => ({
  user: one(user, { fields: [email.userId], references: [user.id] }),
  apiKey: one(apiKey, { fields: [email.apiKeyId], references: [apiKey.id] }),
  webhookDeliveries: many(webhookDelivery),
}));

export const webhookRelations = relations(webhook, ({ one, many }) => ({
  user: one(user, { fields: [webhook.userId], references: [user.id] }),
  deliveries: many(webhookDelivery),
}));

export const webhookDeliveryRelations = relations(webhookDelivery, ({ one }) => ({
  webhook: one(webhook, { fields: [webhookDelivery.webhookId], references: [webhook.id] }),
  email: one(email, { fields: [webhookDelivery.emailId], references: [email.id] }),
}));
