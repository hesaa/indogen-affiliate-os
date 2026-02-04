import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { landing_pages } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Enhanced schema with better validation and documentation
const LandingPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less'),
  product_url: z.string().url('Must be a valid URL'),
  social_proof: z.any().optional(), // JSONB field
  urgency_timer: z.number().int().positive().optional(),
  custom_css: z.string().optional(),
  is_active: z.boolean().optional(),
})

// Centralized error response helper
const createErrorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status })

// Centralized success response helper
const createSuccessResponse = (data: unknown, status: number = 200) =>
  NextResponse.json(data, { status })

// Authentication middleware
const requireAuth = async () => {
  const session = await auth()
  if (!session?.user) {
    return { authorized: false, response: createErrorResponse('Unauthorized', 401) }
  }
  return { authorized: true, session, userId: parseInt(session.user.id) }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authorized) return authResult.response

  const { slug } = await params

  try {
    const [landingPage] = await db
      .select({
        id: landing_pages.id,
        slug: landing_pages.slug,
        title: landing_pages.title,
        description: landing_pages.description,
        product_url: landing_pages.product_url,
        social_proof: landing_pages.social_proof,
        urgency_timer: landing_pages.urgency_timer,
        custom_css: landing_pages.custom_css,
        is_active: landing_pages.is_active,
        click_count: landing_pages.click_count,
        conversion_count: landing_pages.conversion_count,
        created_at: landing_pages.created_at,
        updated_at: landing_pages.updated_at,
      })
      .from(landing_pages)
      .where(eq(landing_pages.slug, slug))
      .limit(1)

    if (!landingPage) {
      return createErrorResponse('Landing page not found', 404)
    }

    return createSuccessResponse(landingPage)
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return createErrorResponse('Failed to fetch landing page', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authorized) return authResult.response

  const { slug } = await params

  try {
    const body = await request.json()
    const parsed = LandingPageSchema.parse(body)

    // First check if the landing page exists and belongs to the user
    const [existing] = await db
      .select({ id: landing_pages.id, user_id: landing_pages.user_id })
      .from(landing_pages)
      .where(eq(landing_pages.slug, slug))
      .limit(1)

    if (!existing) {
      return createErrorResponse('Landing page not found', 404)
    }

    if (existing.user_id !== authResult.userId) {
      return createErrorResponse('Forbidden', 403)
    }

    // Update the landing page
    const [updated] = await db
      .update(landing_pages)
      .set({
        ...parsed,
        updated_at: new Date(),
      })
      .where(eq(landing_pages.slug, slug))
      .returning()

    return createSuccessResponse(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(error.issues[0].message, 400)
    }
    console.error('Error updating landing page:', error)
    return createErrorResponse('Failed to update landing page', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAuth()
  if (!authResult.authorized) return authResult.response

  const { slug } = await params

  try {
    // First check if the landing page exists and belongs to the user
    const [existing] = await db
      .select({ id: landing_pages.id, user_id: landing_pages.user_id })
      .from(landing_pages)
      .where(eq(landing_pages.slug, slug))
      .limit(1)

    if (!existing) {
      return createErrorResponse('Landing page not found', 404)
    }

    if (existing.user_id !== authResult.userId) {
      return createErrorResponse('Forbidden', 403)
    }

    // Delete the landing page
    await db
      .delete(landing_pages)
      .where(eq(landing_pages.slug, slug))

    return createSuccessResponse({ message: 'Landing page deleted successfully' }, 200)
  } catch (error) {
    console.error('Error deleting landing page:', error)
    return createErrorResponse('Failed to delete landing page', 500)
  }
}
