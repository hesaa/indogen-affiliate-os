import { pgTable, serial, text, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const UserRole = pgEnum('user_role', ['user', 'admin']);

export const PlanType = pgEnum('plan_type', ['starter', 'pro', 'empire']);

export const RenderStatus = pgEnum('render_status', ['pending', 'processing', 'completed', 'failed']);

export const SocialPlatform = pgEnum('social_platform', ['tiktok', 'instagram']);

// Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: UserRole('role').default('user'),
  plan: PlanType('plan').notNull().default('starter'),
  max_render_jobs: integer('max_render_jobs').notNull().default(5),
  max_cloaked_links: integer('max_cloaked_links').notNull().default(10),
  max_comment_triggers: integer('max_comment_triggers').notNull().default(5),
  max_social_accounts: integer('max_social_accounts').notNull().default(3),
  max_landing_pages: integer('max_landing_pages').notNull().default(10),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const render_jobs = pgTable('render_jobs', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  input_url: text('input_url').notNull(),
  output_url: text('output_url'),
  status: RenderStatus('status').notNull().default('pending'),
  progress: integer('progress').default(0),
  duration: integer('duration'), // in seconds
  resolution: text('resolution'), // e.g., "1080p"
  format: text('format'), // e.g., "mp4"
  error_message: text('error_message'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const cloaked_links = pgTable('cloaked_links', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  slug: text('slug').notNull().unique(),
  original_url: text('original_url').notNull(),
  cloaked_url: text('cloaked_url').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  image_url: text('image_url'),
  is_active: boolean('is_active').default(true).notNull(),
  click_count: integer('click_count').default(0).notNull(),
  bot_protection: boolean('bot_protection').default(true).notNull(),
  safe_page: boolean('safe_page').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const social_accounts = pgTable('social_accounts', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  platform: SocialPlatform('platform').notNull(),
  username: text('username').notNull(),
  profile_url: text('profile_url'),
  access_token: text('access_token'),
  refresh_token: text('refresh_token'),
  expires_at: timestamp('expires_at'),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const comment_triggers = pgTable('comment_triggers', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  keywords: text('keywords').notNull(), // comma-separated keywords
  response_template: text('response_template').notNull(),
  delay_seconds: integer('delay_seconds').notNull().default(60),
  redirect_url: text('redirect_url'),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const landing_pages = pgTable('landing_pages', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  slug: text('slug').notNull().unique(),
  product_url: text('product_url').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  social_proof: jsonb('social_proof'), // scraped reviews, ratings
  urgency_timer: integer('urgency_timer'), // in minutes
  custom_css: text('custom_css'),
  is_active: boolean('is_active').default(true).notNull(),
  click_count: integer('click_count').default(0).notNull(),
  conversion_count: integer('conversion_count').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for each table
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type RenderJob = typeof render_jobs.$inferSelect;
export type NewRenderJob = typeof render_jobs.$inferInsert;

export type CloakedLink = typeof cloaked_links.$inferSelect;
export type NewCloakedLink = typeof cloaked_links.$inferInsert;

export type SocialAccount = typeof social_accounts.$inferSelect;
export type NewSocialAccount = typeof social_accounts.$inferInsert;

export type CommentTrigger = typeof comment_triggers.$inferSelect;
export type NewCommentTrigger = typeof comment_triggers.$inferInsert;

export type LandingPage = typeof landing_pages.$inferSelect;
export type NewLandingPage = typeof landing_pages.$inferInsert;
