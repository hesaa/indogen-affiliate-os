import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redisClient } from '@/lib/redis/client';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Schema for request body validation
const ScanRequestSchema = z.object({
  platforms: z.array(z.enum(['tiktok', 'instagram'])).optional(),
  keywords: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const parsed = ScanRequestSchema.parse(body);

    // Get authenticated user from request
    const user = request.auth?.user;
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user's connected social accounts
    const connectedAccounts = await prisma.socialAccount.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    if (connectedAccounts.length === 0) {
      return NextResponse.json(
        { error: 'No connected social accounts found' },
        { status: 400 }
      );
    }

    // Filter accounts by requested platforms (if specified)
    const accountsToScan = parsed.platforms
      ? connectedAccounts.filter(account =>
          parsed.platforms.includes(account.platform as 'tiktok' | 'instagram')
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
      userId: user.id,
      accounts: accountsToScan.map(account => ({
        id: account.id,
        platform: account.platform,
        accessToken: account.accessToken,
        username: account.username,
      })),
      keywords: parsed.keywords || [],
      status: 'queued' as const,
      createdAt: new Date().toISOString(),
    };

    // Queue the scan job in Redis
    await redisClient.rpush(
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
    return NextResponse.json(
      { error: 'Failed to queue comment scan job' },
      { status: 500 }
    );
  }
}