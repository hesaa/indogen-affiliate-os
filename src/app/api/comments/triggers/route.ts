import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { db } from '@/lib/db';
import { comment_triggers } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const CreateTriggerSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required'),
  response: z.string().min(1, 'Response message is required'),
  delaySeconds: z.number().min(0).max(300).optional().default(60),
  isActive: z.boolean().optional().default(true),
});

const UpdateTriggerSchema = z.object({
  keyword: z.string().optional(),
  response: z.string().optional(),
  delaySeconds: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const triggers = await db
      .select()
      .from(comment_triggers)
      .where(eq(comment_triggers.user_id, userId))
      .orderBy(desc(comment_triggers.created_at));

    // Map Drizzle fields to API response structure if needed
    const formattedTriggers = triggers.map(t => ({
      id: t.id,
      keyword: t.keywords,
      response: t.response_template,
      delaySeconds: t.delay_seconds,
      isActive: t.is_active,
      createdAt: t.created_at,
    }));

    return NextResponse.json({ triggers: formattedTriggers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const parsed = CreateTriggerSchema.parse(body);

    const [trigger] = await db
      .insert(comment_triggers)
      .values({
        user_id: userId,
        name: parsed.keyword,
        keywords: parsed.keyword,
        response_template: parsed.response,
        delay_seconds: parsed.delaySeconds,
        is_active: parsed.isActive,
      })
      .returning();

    return NextResponse.json({
      trigger: {
        id: trigger.id,
        keyword: trigger.keywords,
        response: trigger.response_template,
        delaySeconds: trigger.delay_seconds,
        isActive: trigger.is_active,
        createdAt: trigger.created_at,
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const triggerId = request.nextUrl.searchParams.get('id');
    if (!triggerId) {
      return NextResponse.json({ error: 'Trigger ID is required' }, { status: 400 });
    }

    const id = parseInt(triggerId);

    // Check if trigger belongs to user
    const [existingTrigger] = await db
      .select()
      .from(comment_triggers)
      .where(and(eq(comment_triggers.id, id), eq(comment_triggers.user_id, userId)))
      .limit(1);

    if (!existingTrigger) {
      return NextResponse.json({ error: 'Trigger not found' }, { status: 404 });
    }

    await db
      .delete(comment_triggers)
      .where(eq(comment_triggers.id, id));

    return NextResponse.json({ success: true, message: 'Trigger deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}