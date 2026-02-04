import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/authOptions'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const landingPages = await prisma.landing_page.findMany({
      where: { user_id: session.user.id },
      select: {
        id: true,
        slug: true,
        title: true,
        product_url: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ landingPages })
  } catch (error) {
    console.error('Error fetching landing pages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, product_url, reviews, timer_duration } = body

    // Validate required fields
    if (!title || !product_url) {
      return NextResponse.json(
        { error: 'Title and product URL are required' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    let slug = baseSlug
    let counter = 1

    while (await prisma.landing_page.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const landingPage = await prisma.landing_page.create({
      data: {
        user_id: session.user.id,
        slug,
        title,
        product_url,
        reviews: reviews || [],
        timer_duration: timer_duration || null,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        product_url: true,
        reviews: true,
        timer_duration: true,
        created_at: true,
        updated_at: true,
      },
    })

    return NextResponse.json({ landingPage }, { status: 201 })
  } catch (error) {
    console.error('Error creating landing page:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}