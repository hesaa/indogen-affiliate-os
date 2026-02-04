import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { social_accounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getRedisClient } from '@/lib/redis/client';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

// Schema for request body validation
const ScanRequestSchema = z.object({
  platforms: z.array(z.enum(['tiktok', 'instagram'])).optional(),
  keywords: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const userId = parseInt(session.user.id)
    const body = await request.json();
    const parsed = ScanRequestSchema.parse(body);

    // Fetch user's connected social accounts
    const connectedAccounts = await db
      .select()
      .from(social_accounts)
      .where(
        and(
          eq(social_accounts.user_id, userId),
          eq(social_accounts.is_active, true)
        )
      );

    if (connectedAccounts.length === 0) {
      return NextResponse.json(
        { error: 'No connected social accounts found' },
        { status: 400 }
      );
    }

    // Filter accounts by requested platforms (if specified)
    const accountsToScan = parsed.platforms
      ? connectedAccounts.filter(account =>
        parsed.platforms!.includes(account.platform as 'tiktok' | 'instagram')
      )
      : connectedAccounts;

    if (accountsToScan.length === 0) {
      return NextResponse.json(
        { error: 'No matching connected accounts for specified platforms' },
        { status: 400 }
      );
    }

    // Generate a unique job ID for tracking
    const jobId = uuidv4();

    // Prepare scan job payload
    const scanJob = {
      id: jobId,
      userId: userId,
      accounts: accountsToScan.map(account => ({
        id: account.id,
        platform: account.platform,
        accessToken: account.access_token,
        username: account.username,
      })),
      keywords: parsed.keywords || [],
      status: 'queued' as const,
      createdAt: new Date().toISOString(),
    };

    // Queue the scan job in Redis
    const redis = getRedisClient()
    await redis.rpush(
      'comment_scan_jobs',
      JSON.stringify(scanJob)
    );

    return NextResponse.json({
      success: true,
      jobId,
      message: `Comment scan job queued successfully. Processing ${accountsToScan.length} account(s).`,
    });
  } catch (error) {
    console.error('Comment scan error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to queue comment scan job' },
      { status: 500 }
    );
  }
}