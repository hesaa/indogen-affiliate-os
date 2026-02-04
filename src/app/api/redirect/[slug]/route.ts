import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { detectBot, generateSafePage } from '@/lib/utils/cloak'
import { getAuthSession } from '@/lib/auth'
import { logger } from '@/lib/utils/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug
  const userAgent = request.headers.get('user-agent') || ''
  const ip = request.ip

  try {
    // Check if slug exists in database
    const cloakedLink = await prisma.cloakedLink.findUnique({
      where: { slug },
      include: { user: true }
    })

    if (!cloakedLink) {
      logger.warn(`Cloaked link not found: ${slug}`)
      return NextResponse.redirect(new URL('/404', request.url))
    }

    // Bot detection
    const isBot = await detectBot(userAgent, ip)

    // Track click regardless of bot status
    await prisma.click.create({
      data: {
        cloakedLinkId: cloakedLink.id,
        ip,
        userAgent,
        isBot,
        timestamp: new Date()
      }
    })

    // If bot detected, serve safe page
    if (isBot) {
      const safePageHtml = await generateSafePage(cloakedLink)
      return NextResponse.json({ html: safePageHtml }, { status: 200 })
    }

    // Redirect real users to target URL
    return NextResponse.redirect(new URL(cloakedLink.targetUrl, request.url))
  } catch (error) {
    logger.error(`Error processing cloaked link redirect: ${error}`)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}