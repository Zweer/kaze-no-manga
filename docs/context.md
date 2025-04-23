**Project Summary: Kaze No Manga**

**1. Project Goal:**
   - Build a responsive web app for reading manga online.
   - Core Features: Track reading progress (last chapter read per manga per user), manage personal library, get notifications for new chapters, discover similar manga.
   - Key Challenge: Handle and normalize manga data potentially originating from multiple external sources.

**2. Technology Stack:**
   - Framework: Next.js (v14+, App Router)
   - Language: TypeScript
   - Styling: Tailwind CSS
   - UI Components: shadcn/ui (local components)
   - Database: Neon (Serverless Postgres)
   - ORM: Drizzle ORM + drizzle-kit
   - DB Driver: @neondatabase/serverless
   - Authentication: Auth.js (v5) with Google provider, JWT strategy, Drizzle Adapter.
   - Hosting & Compute: Vercel
   - Scheduled Tasks: Vercel Cron Jobs
   - External Data: Custom '@zweer/manga-scraper' library.

**3. Database Schema (Drizzle - Key Tables):**
   - `users`, `accounts`, `sessions`, `verificationTokens`: Standard Auth.js tables.
   - `manga`: Stores canonical manga entries (UUID PK `id`, unique `slug`, `title`, metadata).
   - `manga_sources`: Links canonical `manga` (`mangaId` FK) to external sources (`sourceName`, `sourceMangaId` PK/Unique, `sourceUrl`, source-specific `lastChapterChecked`, `lastCheckedAt`, `isPreferredSource` flag).
   - `chapters`: Stores canonical chapter list for a manga (`mangaId` FK, `chapterNumber` (VARCHAR, unique with mangaId), `title`, `publishedAt`). *Currently needs population logic.*
   - `userLibrary`: Junction table (User ID FK, Manga ID FK). Tracks `lastChapterRead` (VARCHAR), `status`, `rating`, `notes`, `notificationsEnabled`.

**4. Key User Flows & Features Status:**
   - **Auth:** Google Login/Logout working (Auth.js, UI components in Header).
   - **Library:** Add/Remove manga working via `LibraryToggleButton` (Client Component) calling Server Actions (`add/removeMangaFromLibrary`) operating on `userLibrary` using `mangaId`. `/library` page displays user's manga using `MangaCard`.
   - **Search:** `/search` page allows internal DB search (via `searchInternalManga` Server Action) and external source search (via `/api/search/external` API Route calling scraper).
   - **Import:** External results shown in `ExternalMangaResultCard` with an "Import" button calling `importMangaMetadataAction` (Server Action). This action fetches details, matches/creates canonical `manga` entry, and adds/updates `manga_sources` record.
   - **Chapter List:** `/manga/[slug]` page displays chapter list fetched *from DB* using `getMangaChaptersFromDB` (Server Action) and `ChapterList` component. DB table `chapters` needs population via `syncChaptersWithSource` action (likely triggered by cron). Chapter sorting needs improvement (handles varchar).
   - **Reader:** `/manga/[slug]/reader/[chapter]` page exists. Server-side fetches preferred source info and calls scraper's `getChapterDetails` to get image URLs *on request*. Client component `MangaReader` displays images, basic controls, and progress bar.
   - **Progress Update:** `MangaReader` uses `IntersectionObserver` to detect chapter end and calls `updateReadingProgress` (Server Action) to save `lastChapterRead` in `userLibrary`.

**5. Key Architectural Decisions:**
   - Prefer Server Actions for UI-triggered mutations.
   - API Routes for external search query (could be Server Action too).
   - UUID PK for `manga`, unique `slug` for URLs.
   - Separate `manga_sources` tracking.
   - `@neondatabase/serverless` driver used.
   - Drizzle ORM.

**6. UI Style:**
   - Minimal, elegant, clean.
   - Light/Dark mode via `next-themes`, shadcn/ui CSS variables.
   - Primary color: Lilac.

**7. Next Steps (Suggested Priority):**
   - **Implement Chapter Syncing:**
     - Create/Refine `syncChaptersWithSource` Server Action to fetch chapter list from preferred source via scraper and populate/update the `chapters` DB table.
     - Implement logic for determining/setting `isPreferredSource` in `manga_sources`.
     - Address numeric sorting issue for `chapterNumber` in `getMangaChaptersFromDB`.
   - **Implement Chapter Navigation in Reader:**
     - Fetch ordered list of `chapterNumber`s on reader page load.
     - Determine previous/next chapter numbers.
     - Pass them to `MangaReader` component.
     - Enable Prev/Next buttons with correct links/navigation.
   - **Implement Vercel Cron Job:**
     - Create an API Route/Server Action endpoint for the update task.
     - Logic: Iterate sources/manga, check for new chapters using scraper, call `syncChaptersWithSource` if needed, update `lastCheckedAt`.
     - Configure job in `vercel.json`.
   - **Implement "NEW" Chapter Notifications:**
     - Update logic in `/library` (`MangaCard`) to compare `userLibrary.lastChapterRead` with the latest chapter available *in the `chapters` DB table*.
     - Display "NEW" badge.
   - **UI/UX Refinements:** Improve external result card, add toasts, implement user lists UI, mobile header menu, loading/error states.
   - **Future:** Sharing lists, recommendations, offline reading.
