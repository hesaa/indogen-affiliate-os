# indogen-affiliate-os

Built by Pure AI Builder (Autonomous Mode).

## 🚀 POST ACTION (How to Run)
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Environment**:
   - Create `.env` based on `.env.example`.
   - Add your DATABASE_URL for Drizzle (PostgreSQL connection string).
3. **Database Migration**:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack
- Frontend: Next.js 16.1.6 (App Router in src/ directory)
- Database: Drizzle ORM with PostgreSQL
- Styling: Tailwind CSS

## 🧠 AI Self-Improvement
This project is under continuous optimization by the AI Builder. 
Check `OPTIMIZATION_LOG.md` for latest improvements.
