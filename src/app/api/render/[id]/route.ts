import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/authOptions'
import { NextAuth } from 'next-auth'
import { NextAuthOptions } from 'next-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get session from NextAuth
  const authOptions: NextAuthOptions = authOptions
  const session = await NextAuth(request, authOptions).getSession()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const userId = session.user.id
  const renderJobId = params.id

  try {
    // Fetch render job with user validation
    const renderJob = await prisma.renderJob.findUnique({
      where: {
        id_userId: {
          id: renderJobId,
          userId: userId,
        },
      },
      select: {
        id: true,
        status: true,
        progress: true,
        outputUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!renderJob) {
      return NextResponse.json(
        { error: 'Render job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(renderJob)
  } catch (error) {
    console.error('Error fetching render job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}