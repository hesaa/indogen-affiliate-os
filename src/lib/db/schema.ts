import { pgTable, serial, text, timestamp, integer, boolean, jsonb, enumType, primaryKey, foreignKey, index } from 'drizzle-orm/pg-core';

// Enums
export const UserRole = enumType({
  name: 'user_role',
  values: ['user', 'admin'] as const,
});

export const PlanType = enumType({
  name: 'plan_type',
  values: ['starter', 'pro', 'empire'] as const,
});

export const RenderStatus = enumType({
  name: 'render_status',
  values: ['pending', 'processing', 'completed', 'failed'] as const,
});

export const SocialPlatform = enumType({
  name: 'social_platform',
  values: ['tiktok', 'instagram'] as const,
});

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
  user_id: foreignKey('user_id', () => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').nullable(),
  input_url: text('input_url').notNull(),
  output_url: text('output_url').nullable(),
  status: RenderStatus('status').notNull().default('pending'),
  progress: integer('progress').default(0).check('[0, 100]'),
  duration: integer('duration').nullable(), // in seconds
  resolution: text('resolution').nullable(), // e.g., "1080p"
  format: text('format').nullable(), // e.g., "mp4"
  error_message: text('error_message').nullable(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const cloaked_links = pgTable('cloaked_links', {
  id: serial('id').primaryKey(),
  user_id: foreignKey('user_id', () => users.id).notNull(),
  slug: text('slug').notNull().unique(),
  original_url: text('original_url').notNull(),
  cloaked_url: text('cloaked_url').notNull(),
  title: text('title').notNull(),
  description: text('description').nullable(),
  image_url: text('image_url').nullable(),
  is_active: boolean('is_active').default(true).notNull(),
  click_count: integer('click_count').default(0).notNull(),
  bot_protection: boolean('bot_protection').default(true).notNull(),
  safe_page: boolean('safe_page').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const social_accounts = pgTable('social_accounts', {
  id: serial('id').primaryKey(),
  user_id: foreignKey('user_id', () => users.id).notNull(),
  platform: SocialPlatform('platform').notNull(),
  username: text('username').notNull(),
  profile_url: text('profile_url').nullable(),
  access_token: text('access_token').nullable(),
  refresh_token: text('refresh_token').nullable(),
  expires_at: timestamp('expires_at').nullable(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const comment_triggers = pgTable('comment_triggers', {
  id: serial('id').primaryKey(),
  user_id: foreignKey('user_id', () => users.id).notNull(),
  name: text('name').notNull(),
  keywords: text('keywords').notNull(), // comma-separated keywords
  response_template: text('response_template').notNull(),
  delay_seconds: integer('delay_seconds').notNull().default(60),
  redirect_url: text('redirect_url').nullable(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const landing_pages = pgTable('landing_pages', {
  id: serial('id').primaryKey(),
  user_id: foreignKey('user_id', () => users.id).notNull(),
  slug: text('slug').notNull().unique(),
  product_url: text('product_url').notNull(),
  title: text('title').notNull(),
  description: text('description').nullable(),
  social_proof: jsonb('social_proof').nullable(), // scraped reviews, ratings
  urgency_timer: integer('urgency_timer').nullable(), // in minutes
  custom_css: text('custom_css').nullable(),
  is_active: boolean('is_active').default(true).notNull(),
  click_count: integer('click_count').default(0).notNull(),
  conversion_count: integer('conversion_count').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Indexes for performance
export const indexes = [
  index('render_jobs_user_id_idx', render_jobs.user_id),
  index('cloaked_links_user_id_idx', cloaked_links.user_id),
  index('social_accounts_user_id_idx', social_accounts.user_id),
  index('comment_triggers_user_id_idx', comment_triggers.user_id),
  index('landing_pages_user_id_idx', landing_pages.user_id),
  index('cloaked_links_slug_idx', cloaked_links.slug),
  index('landing_pages_slug_idx', landing_pages.slug),
];