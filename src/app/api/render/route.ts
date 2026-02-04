import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redisClient } from '@/lib/redis/client'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { authOptions } from '@/lib/auth/authOptions'
import { NextAuth } from 'next-auth'
import { NextAuthOptions } from 'next-auth/internals'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/utils'
import { ReadableStream } from 'stream/web'
import { Blob } from 'buffer'

const renderJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  templateId: z.string().optional(),
})

const fileSchema = z.object({
  videoFile: z.instanceof(ReadableStream).refine(
    (stream) => stream instanceof ReadableStream,
    'Valid video file required'
  ),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions as NextAuthOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()

    // Validate job metadata
    const parsed = renderJobSchema.parse({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      templateId: formData.get('templateId') as string,
    })

    // Validate file separately
    fileSchema.parse({
      videoFile: formData.get('videoFile') as ReadableStream,
    })

    const userId = session.user.id
    const jobId = uuidv4()

    // Save job to database
    const renderJob = await prisma.renderJob.create({
      data: {
        id: jobId,
        userId,
        title: parsed.title,
        description: parsed.description,
        status: 'queued',
        templateId: parsed.templateId,
      },
    })

    // Convert ReadableStream to Blob for Redis storage
    const videoFile = formData.get('videoFile') as ReadableStream
    const chunks: Uint8Array[] = []
    for await (const chunk of videoFile) {
      chunks.push(new Uint8Array(await chunk.arrayBuffer()))
    }
    const blob = new Blob(chunks)

    // Queue job in Redis
    const jobPayload = {
      id: jobId,
      userId,
      title: parsed.title,
      videoFile: blob,
      templateId: parsed.templateId,
    }

    await redisClient.rpush('render_jobs', JSON.stringify(jobPayload))

    return NextResponse.json(
      {
        success: true,
        job: {
          id: renderJob.id,
          title: renderJob.title,
          status: renderJob.status,
          createdAt: renderJob.createdAt.toISOString(),
        },
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
  const session = await getServerSession(authOptions as NextAuthOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const userId = session.user.id
    const jobs = await prisma.renderJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      {
        success: true,
        jobs: jobs.map((job) => ({
          id: job.id,
          title: job.title,
          description: job.description,
          status: job.status,
          progress: job.progress,
          outputUrl: job.outputUrl,
          createdAt: job.createdAt.toISOString(),
        })),
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