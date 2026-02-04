import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { render_jobs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getRedisClient } from '@/lib/redis/client'
import { z } from 'zod'
import { authOptions } from '@/lib/auth/authOptions'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/utils/logger'

const renderJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  input_url: z.string().url('Valid input URL is required'),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const parsed = renderJobSchema.parse(body)

    const userId = parseInt(session.user.id)

    // Save job to database
    const [renderJob] = await db
      .insert(render_jobs)
      .values({
        user_id: userId,
        title: parsed.title,
        description: parsed.description,
        input_url: parsed.input_url,
        status: 'pending',
      })
      .returning()

    // Queue job in Redis
    const redis = getRedisClient()
    const jobPayload = {
      id: renderJob.id,
      user_id: userId,
      input_url: parsed.input_url,
      status: 'pending',
      progress: 0,
      retries: 0
    }

    await redis.rpush('render_jobs', JSON.stringify(jobPayload))

    return NextResponse.json(
      {
        success: true,
        job: renderJob,
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Render job creation failed', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create render job' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const userId = parseInt(session.user.id)
    const jobs = await db
      .select()
      .from(render_jobs)
      .where(eq(render_jobs.user_id, userId))
      .orderBy(desc(render_jobs.created_at))

    return NextResponse.json(
      {
        success: true,
        jobs,
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Failed to fetch render jobs', error)
    return NextResponse.json(
      { error: 'Failed to fetch render jobs' },
      { status: 500 }
    )
  }
}