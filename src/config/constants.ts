// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// App Configuration
export const APP_NAME = 'IndoGen Affiliate OS'
export const APP_DESCRIPTION = 'Micro SaaS for Affiliate Marketing'

// Plan Limits
export const PLAN_LIMITS = {
    starter: {
        renderJobs: 5,
        cloakedLinks: 10,
        commentTriggers: 5,
        socialAccounts: 3,
        landingPages: 10,
    },
    pro: {
        renderJobs: 50,
        cloakedLinks: 100,
        commentTriggers: 50,
        socialAccounts: 10,
        landingPages: 100,
    },
    empire: {
        renderJobs: -1, // unlimited
        cloakedLinks: -1,
        commentTriggers: -1,
        socialAccounts: -1,
        landingPages: -1,
    },
} as const
