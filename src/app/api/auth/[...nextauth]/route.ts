import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth/authOptions'
import { routeHandler } from '@/lib/auth/routeHandler'

export default NextAuth(authOptions)