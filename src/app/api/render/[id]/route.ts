import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { render_jobs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/authOptions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const userId = parseInt(session.user.id)
  const { id: jobIdStr } = await params
  const jobId = parseInt(jobIdStr)

  if (isNaN(jobId)) {
    return NextResponse.json(
      { error: 'Invalid job ID' },
      { status: 400 }
    )
  }

  try {
    // Fetch render job with user validation
    const [job] = await db
      .select()
      .from(render_jobs)
      .where(
        and(
          eq(render_jobs.id, jobId),
          eq(render_jobs.user_id, userId)
        )
      )
      .limit(1)

    if (!job) {
      return NextResponse.json(
        { error: 'Render job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching render job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}