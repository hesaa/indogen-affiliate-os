import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { cloaked_links } from '@/lib/db/schema'
import { eq, and, or, desc } from 'drizzle-orm'
import { authOptions } from '@/lib/auth/authOptions'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

const linkSchema = z.object({
  targetUrl: z.string().url().min(1, 'Target URL is required'),
  slug: z.string().optional(),
  title: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = parseInt(session.user.id)
    const links = await db
      .select()
      .from(cloaked_links)
      .where(eq(cloaked_links.user_id, userId))
      .orderBy(desc(cloaked_links.created_at))

    return NextResponse.json(links)
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = parseInt(session.user.id)
    const body = await request.json()
    const parsed = linkSchema.parse(body)

    const { targetUrl, slug, title } = parsed

    // Check if slug already exists
    if (slug) {
      const [existingSlug] = await db
        .select()
        .from(cloaked_links)
        .where(eq(cloaked_links.slug, slug))
        .limit(1)

      if (existingSlug) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
      }
    }

    const finalSlug = slug || generateSlug()

    const [link] = await db
      .insert(cloaked_links)
      .values({
        user_id: userId,
        slug: finalSlug,
        original_url: targetUrl,
        title: title || finalSlug,
        cloaked_url: `/api/redirect/${finalSlug}`,
        is_active: true,
      })
      .returning()

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error('Error creating link:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateSlug(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}${random}`
}