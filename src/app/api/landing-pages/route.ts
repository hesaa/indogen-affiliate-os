import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { landing_pages } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

// Schema for creating landing pages
const CreateLandingPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  product_url: z.string().url('Must be a valid URL'),
  social_proof: z.any().optional(), // JSONB field for reviews/ratings
  urgency_timer: z.number().int().positive().optional(),
  custom_css: z.string().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    console.log('API landing-pages session:', !!session)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized', debug: 'No session' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const landingPagesList = await db
      .select()
      .from(landing_pages)
      .where(eq(landing_pages.user_id, userId))
      .orderBy(desc(landing_pages.created_at))

    return NextResponse.json({ landingPages: landingPagesList })
  } catch (error: any) {
    console.error('Error fetching landing pages:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const body = await request.json()

    // Validate request body
    const parsed = CreateLandingPageSchema.parse(body)

    // Generate unique slug from title
    const baseSlug = parsed.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    let slug = baseSlug
    let counter = 1

    // Check if slug exists and generate unique one
    while (true) {
      const [existing] = await db
        .select({ id: landing_pages.id })
        .from(landing_pages)
        .where(eq(landing_pages.slug, slug))
        .limit(1)

      if (!existing) break

      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create landing page
    const [landingPage] = await db
      .insert(landing_pages)
      .values({
        user_id: userId,
        slug,
        title: parsed.title,
        description: parsed.description || null,
        product_url: parsed.product_url,
        social_proof: parsed.social_proof || null,
        urgency_timer: parsed.urgency_timer || null,
        custom_css: parsed.custom_css || null,
        is_active: true,
      })
      .returning({
        id: landing_pages.id,
        slug: landing_pages.slug,
        title: landing_pages.title,
        description: landing_pages.description,
        product_url: landing_pages.product_url,
        social_proof: landing_pages.social_proof,
        urgency_timer: landing_pages.urgency_timer,
        custom_css: landing_pages.custom_css,
        is_active: landing_pages.is_active,
        created_at: landing_pages.created_at,
        updated_at: landing_pages.updated_at,
      })

    return NextResponse.json({ landingPage }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error('Error creating landing page:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}