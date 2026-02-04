import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth/routeHandler';
import { z } from 'zod';

const CreateTriggerSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required'),
  response: z.string().min(1, 'Response message is required'),
  delaySeconds: z.number().min(0).max(300),
  isActive: z.boolean().optional(),
});

const UpdateTriggerSchema = z.object({
  keyword: z.string().optional(),
  response: z.string().optional(),
  delaySeconds: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await auth();
    const triggers = await prisma.commentTrigger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ triggers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    const body = await request.json();
    const parsed = CreateTriggerSchema.parse(body);

    const trigger = await prisma.commentTrigger.create({
      data: {
        keyword: parsed.keyword,
        response: parsed.response,
        delaySeconds: parsed.delaySeconds,
        isActive: parsed.isActive ?? true,
        userId: user.id,
      },
    });

    return NextResponse.json({ trigger }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await auth();
    const body = await request.json();
    const parsed = UpdateTriggerSchema.parse(body);

    if (!parsed.keyword && !parsed.response && !parsed.delaySeconds && !parsed.isActive) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    const triggerId = request.nextUrl.searchParams.get('id');
    if (!triggerId) {
      return NextResponse.json({ error: 'Trigger ID is required' }, { status: 400 });
    }

    const existingTrigger = await prisma.commentTrigger.findFirst({
      where: { id: parseInt(triggerId), userId: user.id },
    });

    if (!existingTrigger) {
      return NextResponse.json({ error: 'Trigger not found' }, { status: 404 });
    }

    const updatedTrigger = await prisma.commentTrigger.update({
      where: { id: existingTrigger.id },
      data: {
        keyword: parsed.keyword ?? existingTrigger.keyword,
        response: parsed.response ?? existingTrigger.response,
        delaySeconds: parsed.delaySeconds ?? existingTrigger.delaySeconds,
        isActive: parsed.isActive ?? existingTrigger.isActive,
      },
    });

    return NextResponse.json({ trigger: updatedTrigger });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await auth();
    const triggerId = request.nextUrl.searchParams.get('id');
    if (!triggerId) {
      return NextResponse.json({ error: 'Trigger ID is required' }, { status: 400 });
    }

    const existingTrigger = await prisma.commentTrigger.findFirst({
      where: { id: parseInt(triggerId), userId: user.id },
    });

    if (!existingTrigger) {
      return NextResponse.json({ error: 'Trigger not found' }, { status: 404 });
    }

    await prisma.commentTrigger.delete({
      where: { id: existingTrigger.id },
    });

    return NextResponse.json({ message: 'Trigger deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}