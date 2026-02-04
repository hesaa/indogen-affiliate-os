import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
    try {
        const user = await getAuthUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error in /api/user GET:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
