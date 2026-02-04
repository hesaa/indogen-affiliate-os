import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { social_accounts } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { z } from 'zod'

// Schema validation for request bodies
const connectAccountSchema = z.object({
  platform: z.enum(['tiktok', 'instagram']).default('tiktok'),
  username: z.string().min(1, 'Username is required'),
  token: z.string().min(1, 'Token is required'),
  profileUrl: z.string().url().optional(),
})

const disconnectAccountSchema = z.object({
  id: z.string(),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = parseInt(session.user.id)
    const body = await request.json()
    const validatedData = connectAccountSchema.parse(body)

    const [existingAccount] = await db
      .select()
      .from(social_accounts)
      .where(
        and(
          eq(social_accounts.user_id, userId),
          eq(social_accounts.platform, validatedData.platform),
          eq(social_accounts.username, validatedData.username)
        )
      )
      .limit(1)

    if (existingAccount) {
      return NextResponse.json(
        { error: 'This account is already connected' },
        { status: 400 }
      )
    }

    const [account] = await db
      .insert(social_accounts)
      .values({
        user_id: userId,
        platform: validatedData.platform,
        username: validatedData.username,
        access_token: validatedData.token, // Map token to access_token
        profile_url: validatedData.profileUrl,
        is_active: true,
      })
      .returning()

    return NextResponse.json({ account })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid request data' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = parseInt(session.user.id)
    const accounts = await db
      .select()
      .from(social_accounts)
      .where(eq(social_accounts.user_id, userId))
      .orderBy(desc(social_accounts.created_at))

    return NextResponse.json({ accounts })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = parseInt(session.user.id)
    const { searchParams } = new URL(request.url)
    const idStr = searchParams.get('id')

    if (!idStr) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const id = parseInt(idStr)

    const [account] = await db
      .select()
      .from(social_accounts)
      .where(
        and(
          eq(social_accounts.id, id),
          eq(social_accounts.user_id, userId)
        )
      )
      .limit(1)

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    await db
      .delete(social_accounts)
      .where(eq(social_accounts.id, id))

    return NextResponse.json({ message: 'Account disconnected successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}