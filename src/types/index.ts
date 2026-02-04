export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'admin'
  plan: 'starter' | 'pro' | 'empire'
  stripeCustomerId?: string
  createdAt: Date
  updatedAt: Date
}

export interface RenderJob {
  id: string
  userId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  inputUrl: string
  outputUrl?: string
  type: 'smart_content_rotator' | 'automated_comment_sniper' | 'advanced_link_cloaker' | 'micro_landing_page'
  settings: RenderJobSettings
  progress?: number
  error?: string
  metadata?: Record<string, any>
  createdAt: Date | string
  updatedAt: Date | string
}

export interface RenderJobSettings {
  smartContentRotator?: {
    shuffle: boolean
    metadataScrub: boolean
    dynamicOverlay: boolean
  }
  automatedCommentSniper?: {
    keywords: string[]
    replyTemplates: string[]
    delayRange: [number, number]
    redirectUrl: string
  }
  advancedLinkCloaker?: {
    slug: string
    destinationUrl: string
    botProtection: boolean
    safePage: boolean
  }
  microLandingPage?: {
    productUrl: string
    socialProof: string[]
    urgencyTimer: boolean
    customCss?: string
  }
}

export interface CloakedLink {
  id: string
  userId: string
  slug: string
  destinationUrl: string
  clicks: number
  botClicks: number
  createdAt: Date
  updatedAt: Date
}

export interface CommentTrigger {
  id: string
  userId: string
  keyword: string
  replyTemplate: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SocialAccount {
  id: string
  userId: string
  platform: 'tiktok' | 'instagram'
  username: string
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface LandingPage {
  id: string
  userId: string
  slug: string
  productUrl: string
  socialProof: string[]
  urgencyTimer: boolean
  customCss?: string
  views: number
  conversions: number
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Plan {
  name: 'starter' | 'pro' | 'empire'
  price: number
  renderLimit: number
  linkLimit: number
  commentScanLimit: number
  landingPageLimit: number
}

export interface DashboardStats {
  renderJobs: {
    total: number
    completed: number
    processing: number
    failed: number
  }
  cloakedLinks: {
    total: number
    clicks: number
    conversionRate: number
  }
  commentTriggers: {
    total: number
    active: number
  }
  landingPages: {
    total: number
    views: number
    conversions: number
  }
}

export interface SocialProof {
  platform: 'shopee' | 'tokopedia' | 'amazon' | 'ebay'
  rating: number
  reviewCount: number
  reviews: string[]
}

export interface BotDetectionResult {
  isBot: boolean
  botType?: 'crawler' | 'scraper' | 'automated'
  confidence: number
}

export interface RedirectInfo {
  originalUrl: string
  finalUrl: string
  clicks: number
  botClicks: number
  conversion: boolean
}

export interface Comment {
  id: string
  postId: string
  author: string
  text: string
  platform: 'tiktok' | 'instagram'
  createdAt: Date
}

export interface AutoReply {
  commentId: string
  triggerKeyword: string
  replyText: string
  status: 'pending' | 'sent' | 'failed'
  error?: string
  createdAt: Date
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  plan: 'starter' | 'pro' | 'empire'
  token?: string
}

// API Error classes
export class ApiError extends Error {
  code?: string
  status?: number

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export class APIError extends Error {
  code?: string
  status?: number

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.code = code
  }
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Upload types
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  percent?: number // Alias for compatibility
}

// Comment Scan types
export type ScanStatus = 'idle' | 'scanning' | 'completed' | 'error'

export interface CommentScanResponse {
  id: string
  status: ScanStatus
  platform: 'tiktok' | 'instagram'
  postId: string
  commentsFound: number
  triggersMatched: number
  repliesSent: number
  error?: string
  createdAt: Date
  completedAt?: Date
}

// Product/Review types
export interface ProductReview {
  id: string
  author: string
  rating: number
  text: string
  date: Date
  verified?: boolean
}

export interface SocialProofData {
  platform: 'shopee' | 'tokopedia' | 'amazon' | 'ebay'
  rating: number
  reviewCount: number
  reviews: ProductReview[]
  totalSales?: number
}
