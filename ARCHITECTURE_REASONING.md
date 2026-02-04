# Architecture Reasoning
## Project: indogen-affiliate-os

### Design Decisions
This architecture fulfills the blueprint by delivering a scalable, type-safe micro-SaaS with clear separation of concerns. The Next.js 14 App Router (in src/) provides a modern, server-component-first UI with API routes for all four pillars. Drizzle ORM ensures PostgreSQL interactions are type-safe and maintainable. The Bun rendering worker (src/worker/renderWorker.ts) handles CPU-intensive video processing with minimal overhead via Bun.spawn and Redis queuing, preventing serverless timeout issues. All source code resides in src/ as mandated, with configuration files in root. The design supports horizontal scaling: the worker can be replicated independently, and the stateless Next.js app can be deployed on Vercel/Node.js hosting. Authentication via NextAuth secures user data isolation per plan (Starter/Pro/Empire). The bot-filtering cloaker and comment sniper use server-side logic to avoid client-side detection, while the landing page generator creates SEO-friendly public pages. This structure aligns with the 30-day MVP plan: Weeks 1-2 focus on the Rotator (core rendering pipeline), Week 3 adds Cloaker and Landing Pages, and Week 4 enables Comment Sniper integration with social APIs. The use of Redis for job queuing ensures reliability, and the modular component library (src/components/) allows rapid UI iteration for Indonesian affiliate creators.

### Tech Stack Optimization
- Framework: Next.js 16.1.6 (App Router in src/ directory)
- Database: Drizzle ORM with PostgreSQL

### Strategic Summary
Built with autonomous optimization loop. The AI is learning from every file generation.
