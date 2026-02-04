import { pgTable, serial, text, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './schema';

export const cloakedLinkStatus = pgEnum('cloaked_link_status', ['active', 'inactive', 'suspended']);

export const cloakedLinks = pgTable('cloaked_links', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
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

export type CloakedLink = typeof cloakedLinks.$inferSelect;
export type NewCloakedLink = typeof cloakedLinks.$inferInsert;