**Project Goal:**
Create a web application (desktop & mobile responsive) called "Kaze No Manga" allowing users to read their favorite manga online. Key features include tracking reading progress across devices (remembering the last chapter read), managing a personal library of manga being read, receiving notifications for new chapter releases, and discovering new manga similar to ones they like. A core challenge is handling manga potentially available from multiple external sources and presenting a unified view.

**Chosen Technology Stack:**
- **Framework:** Next.js (v14+ with App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (components stored locally, customizable)
- **Database:** Neon (Serverless Postgres)
- **ORM:** Drizzle ORM (with drizzle-kit for migrations)
- **DB Driver:** @neondatabase/serverless (optimized for serverless/edge)
- **Authentication:** Auth.js (v5, formerly NextAuth.js) using Google provider (potentially others later) with JWT strategy and Drizzle Adapter.
- **Hosting & Serverless Compute:** Vercel
- **Scheduled Tasks (Cron):** Vercel Cron Jobs (calling API Routes or Server Actions)
- **External Data Fetching:** Custom library '@zweer/manga-scraper' (assumed available) for searching/fetching details from external sources.

**Database Schema (Drizzle - Key Tables):**
- **`users`:** Standard Auth.js user table.
- **`accounts`:** Standard Auth.js accounts table.
- **`sessions`:** Standard Auth.js sessions table (if using 'database' strategy, though currently JWT).
- **`verificationTokens`:** Standard Auth.js verification tokens table.
- **`manga`:** Stores "canonical" manga entries.
    - `id` (UUID, PK, auto-generated)
    *   `slug` (VARCHAR, Unique Index) - URL-friendly identifier.
    *   `title`, `author`, `artist`, `description`, `coverUrl`, `status`, `genres` (JSONB) - Canonical metadata.
- **`manga_sources`:** Links canonical manga to external sources.
    *   `id` (Serial, PK)
    *   `mangaId` (UUID, FK to `manga.id`)
    *   `sourceName` (VARCHAR, Not Null) - Name of the external source.
    *   `sourceMangaId` (TEXT, Not Null) - ID of the manga on the external source.
    *   `sourceUrl` (TEXT) - URL on the external source.
    *   `lastChapterChecked` (VARCHAR) - Last chapter found on this source.
    *   `lastCheckedAt` (TIMESTAMP) - Last check time for this source.
    *   `isPreferredSource` (BOOLEAN) - Indicates default source for reading.
    *   Unique Index on `(mangaId, sourceName)`.
- **`chapters`:** Stores canonical chapter list for a manga.
    *   `id` (Serial, PK)
    *   `mangaId` (UUID, FK to `manga.id`)
    *   `chapterNumber` (VARCHAR, Not Null)
    *   `title` (VARCHAR)
    *   `publishedAt` (TIMESTAMP)
    *   Unique Index on `(mangaId, chapterNumber)`.
    *   *(Note: Populating this table and handling chapter URLs dynamically based on preferred source needs further implementation).*
- **`userLibrary`:** Junction table linking users and canonical manga.
    *   `userId` (TEXT, FK to `users.id`)
    *   `mangaId` (UUID, FK to `manga.id`)
    *   `lastChapterRead` (VARCHAR) - Tracks user progress.
    *   `addedAt` (TIMESTAMP)
    *   `status` (VARCHAR - Reading, Completed, etc.)
    *   `rating` (INTEGER)
    *   `notes` (TEXT)
    *   `notificationsEnabled` (BOOLEAN)
    *   Primary Key on `(userId, mangaId)`.

**Key User Flows & Features Implemented/Planned:**
- User Registration/Login via Google (Auth.js).
- Search Page: Searches internal DB (`manga` table via Server Action) and external sources (via API Route calling scraper).
- Import Flow: External search results allow triggering an "Import" Server Action. This action fetches detailed metadata, performs basic title/slug matching to find/create a canonical `manga` entry, and adds/updates the entry in `manga_sources`. Returns canonical manga ID/slug.
- Manga Detail Page (`/manga/[slug]`): Displays canonical manga info. Shows Add/Remove to Library button (Client Component using Server Actions `add/removeMangaFromLibrary` which operate on `userLibrary` using `mangaId`).
- User Library Page (`/library`): Protected route. Displays manga the user has added (`userLibrary`), fetching related canonical `manga` data using Drizzle relations. Shows "NEW" badge if `manga_sources.lastChapterChecked` (from preferred source - logic TBD) > `userLibrary.lastChapterRead`.
- Reading Progress Tracking (Partially implemented via `userLibrary.lastChapterRead`).
- Manga Reader UI (Component exists, needs integration/chapter fetching logic).
- Scheduled Job (Vercel Cron): Planned for checking chapter updates using scraper and updating `manga_sources.lastChapterChecked`.

**Key Architectural Decisions:**
- Server Actions are preferred for UI-triggered mutations (import, add/remove library).
- API Routes can be used for queries or potentially external access (like external search).
- UUIDs used as primary keys for `manga` table to handle multiple sources robustly.
- Slugs are unique identifiers for URLs (`/manga/[slug]`).
- Separate `manga_sources` table tracks individual source information.
- Using `@neondatabase/serverless` driver for optimal Neon connection from Vercel.
- Using Drizzle ORM and Drizzle Kit for schema management and migrations.

**UI Style:**
- Minimal, elegant, clean, modern.
- Light/Dark mode support via `next-themes` and CSS variables.
- Primary accent color: Lilac.
- Component Library: shadcn/ui with Tailwind CSS.

**Current Status:**
Core authentication, DB schema for manga/sources/library, search (internal/external), basic import action, library add/remove, and library view page are implemented. Need to implement chapter fetching/display, reader logic, scheduled update job, notifications, user lists, and UI refinements.
