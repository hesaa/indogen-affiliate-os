import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/authOptions'
import { getServerSession } from 'next-auth'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const linkSchema = z.object({
  targetUrl: z.string().url().min(1, 'Target URL is required'),
  slug: z.string().optional(),
})

type LinkBody = z.infer<typeof linkSchema>

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const links = await prisma.cloakedLink.findMany({
      where: { userId: session.user.id },
      include: {
        clicks: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedLinks = links.map(link => ({
      id: link.id,
      slug: link.slug,
      targetUrl: link.targetUrl,
      createdAt: link.createdAt,
      clickCount: link.clicks.length,
      lastClickedAt: link.clicks.length > 0 ? link.clicks[link.clicks.length - 1].createdAt : null,
    }))

    return NextResponse.json(formattedLinks)
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: LinkBody
    try {
      body = linkSchema.parse(await request.json())
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { targetUrl, slug } = body

    const existingLink = await prisma.cloakedLink.findFirst({
      where: {
        OR: [
          { slug },
          { targetUrl, userId: session.user.id },
        ],
      },
    })

    if (existingLink) {
      return NextResponse.json({ error: 'Link with this slug or target URL already exists' }, { status: 409 })
    }

    const linkSlug = slug || generateSlug()

    const link = await prisma.cloakedLink.create({
      data: {
        slug: linkSlug,
        targetUrl,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      id: link.id,
      slug: link.slug,
      targetUrl: link.targetUrl,
      createdAt: link.createdAt,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateSlug(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}${random}`
}