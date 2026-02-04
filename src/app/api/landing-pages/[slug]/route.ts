import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/authOptions'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

const LandingPageSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  productUrl: z.string().url(),
  socialProof: z.string().min(1).max(1000).optional(),
  urgencyTimer: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const landingPage = await prisma.landingPage.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      productUrl: true,
      socialProof: true,
      urgencyTimer: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!landingPage) {
    return NextResponse.json(
      { error: 'Landing page not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(landingPage)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await request.json()
  const parsed = LandingPageSchema.parse(body)

  const landingPage = await prisma.landingPage.update({
    where: {
      slug: params.slug,
    },
    data: parsed,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      productUrl: true,
      socialProof: true,
      urgencyTimer: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json(landingPage)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  await prisma.landingPage.delete({
    where: {
      slug: params.slug,
    },
  })

  return NextResponse.json({ message: 'Landing page deleted successfully' })
}