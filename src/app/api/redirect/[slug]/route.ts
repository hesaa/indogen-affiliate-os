import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cloaked_links } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { CloakUtils, generateSafePage } from '@/lib/utils/cloak'
import { logger } from '@/lib/utils/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    // Check if slug exists in database
    const [cloakedLink] = await db
      .select()
      .from(cloaked_links)
      .where(eq(cloaked_links.slug, slug))
      .limit(1)

    if (!cloakedLink) {
      logger.warn(`Cloaked link not found: ${slug}`)
      return NextResponse.redirect(new URL('/404', request.url))
    }

    // Bot detection using CloakUtils
    const botResult = await CloakUtils.detectBot(request)

    // Track click regardless of bot status
    await db
      .update(cloaked_links)
      .set({
        click_count: (cloakedLink.click_count || 0) + 1,
        updated_at: new Date()
      })
      .where(eq(cloaked_links.id, cloakedLink.id))

    // If bot detected, serve safe page
    if (botResult.isBot) {
      const safePageHtml = generateSafePage({
        targetURL: cloakedLink.original_url,
        brandName: 'Product Offer',
        productTitle: cloakedLink.title || 'Special Offer',
        productImage: cloakedLink.image_url || undefined,
      })
      return new NextResponse(safePageHtml, {
        headers: { 'Content-Type': 'text/html' },
      })
    }

    // Redirect real users to target URL
    return NextResponse.redirect(new URL(cloakedLink.original_url, request.url))
  } catch (error) {
    logger.error(`Error processing cloaked link redirect: ${error}`)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}