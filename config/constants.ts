// src/config/constants.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const FEATURE_FLAGS = {
  RENDER_ENABLED: process.env.NEXT_PUBLIC_RENDER_ENABLED === 'true',
  CLOAKING_ENABLED: process.env.NEXT_PUBLIC_CLOAKING_ENABLED === 'true',
  COMMENT_SNIFFER_ENABLED: process.env.NEXT_PUBLIC_COMMENT_SNIFFER_ENABLED === 'true',
  LANDING_PAGES_ENABLED: process.env.NEXT_PUBLIC_LANDING_PAGES_ENABLED === 'true',
  SOCIAL_PROOF_SCRAPER_ENABLED: process.env.NEXT_PUBLIC_SOCIAL_PROOF_SCRAPER_ENABLED === 'true',
};

export const PLAN_FEATURES = {
  STARTER: {
    MAX_RENDER_JOBS: 5,
    MAX_CLOAKED_LINKS: 10,
    MAX_COMMENT_TRIGGERS: 3,
    MAX_LANDING_PAGES: 2,
  },
  PRO: {
    MAX_RENDER_JOBS: 20,
    MAX_CLOAKED_LINKS: 50,
    MAX_COMMENT_TRIGGERS: 10,
    MAX_LANDING_PAGES: 10,
  },
  EMPIRE: {
    MAX_RENDER_JOBS: 100,
    MAX_CLOAKED_LINKS: 200,
    MAX_COMMENT_TRIGGERS: 50,
    MAX_LANDING_PAGES: 50,
  },
};

export const SOCIAL_PLATFORMS = ['tiktok', 'instagram'] as const;

export const RENDER_JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const CLOAKING_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
} as const;

export const COMMENT_SCAN_STATUS = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const LANDING_PAGE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const SOCIAL_PROOF_SOURCES = ['shopee', 'tokopedia'] as const;

export const DEFAULT_RENDER_OPTIONS = {
  RESOLUTION: '1080p',
  FORMAT: 'mp4',
  WATERMARK: true,
  TRANSITIONS: true,
};

export const DEFAULT_CLOAKING_OPTIONS = {
  BOT_DETECTION: true,
  SAFE_PAGE: true,
  CLICK_TRACKING: true,
};

export const DEFAULT_LANDING_PAGE_OPTIONS = {
  TIMER_ENABLED: true,
  SOCIAL_PROOF_ENABLED: true,
  AUTO_GENERATE: true,
};

export const REDIS_JOB_QUEUE = 'indogen-render-jobs';