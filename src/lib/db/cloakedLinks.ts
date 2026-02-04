import { pgTable, serial, text, timestamp, integer, boolean, enumType } from 'drizzle-orm/pg-core';
import { users } from './users'; // Added missing import

export const cloakedLinkStatus = enumType({
  name: 'cloaked_link_status',
  values: ['active', 'inactive', 'suspended'] as const,
});

export const cloakedLinks = pgTable('cloaked_links', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  }),
  slug: text('slug').notNull().unique(),
  destination_url: text('destination_url').notNull(),
  cloaked_url: text('cloaked_url').notNull().unique(),
  title: text('title'),
  description: text('description'),
  image_url: text('image_url'),
  click_count: integer('click_count').default(0),
  unique_clicks: integer('unique_clicks').default(0),
  bot_click_count: integer('bot_click_count').default(0),
  status: cloakedLinkStatus('status').default('active'),
  is_safe_page: boolean('is_safe_page').default(false),
  safe_page_html: text('safe_page_html'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type CloakedLink = {
  id: number;
  user_id: number;
  slug: string;
  destination_url: string;
  cloaked_url: string;
  title?: string;
  description?: string;
  image_url?: string;
  click_count: number;
  unique_clicks: number;
  bot_click_count: number;
  status: 'active' | 'inactive' | 'suspended';
  is_safe_page: boolean;
  safe_page_html?: string;
  created_at: Date;
  updated_at: Date;
};