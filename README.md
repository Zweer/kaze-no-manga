# KazeNoManga - A Modern Manga Reading Platform

![Coverage Badge](https://img.shields.io/badge/coverage-21%25-red?style=flat)

## 📚 Table of Contents

- [🚀 Project Overview](#-project-overview)
- [🛠️ Tech Stack](#-tech-stack)
- [☁️ Cloud Infrastructure](#-cloud-infrastructure)
- [🗺️ Development Roadmap](#-development-roadmap)

## 🚀 Project Overview

**KazeNoManga** is a modern, responsive web portal for manga and webtoon enthusiasts. The core problem it aims to solve is the lack of a seamless, cross-device reading experience in existing platforms. Users often lose track of their progress when switching between their phone, tablet, and desktop.

Our primary focus is to provide a "sync-first" platform where a user's reading progress—down to the exact scroll position in a chapter—is automatically saved and synchronized across all their logged-in devices.

### Key Features

*   **Cross-Device Sync:** Automatically save and sync reading progress.
*   **On-Demand Library:** The platform's library is populated on-demand from a larger, external source. Manga are added to our database for tracking only when a user engages with them.
*   **Webtoon-First Reader:** The UI is optimized for a vertical scrolling experience, ideal for webtoons.
*   **Responsive Design:** A clean and functional interface on both mobile and desktop.
*   **Theming:** Support for both Light and Dark modes.
*   **User-Centric Features:** Notifications for new chapters, bookmarks, and a personal reading history dashboard.

## 🛠️ Tech Stack

This project will be built using a modern, type-safe, and scalable technology stack.

*   **Framework:** [**Next.js**](https://nextjs.org/) (with App Router) for its hybrid rendering capabilities (Server/Client Components), performance, and robust ecosystem.
*   **UI Components:** [**Shadcn/UI**](https://ui.shadcn.com/) for a collection of beautifully designed, accessible, and fully customizable components. It's not a component library, but a set of recipes we can own and adapt.
*   **Styling:** [**Tailwind CSS**](https://tailwindcss.com/) for a utility-first CSS framework that allows for rapid and consistent UI development.
*   **Authentication:** [**Auth.js**](https://authjs.dev/) (formerly NextAuth.js) as the go-to solution for handling user authentication. We will use the official Drizzle adapter.
*   **Database:** [**PostgreSQL**](https://www.postgresql.org/) for its reliability and robust feature set.
*   **ORM:** [**Drizzle ORM**](https://orm.drizzle.team/) for its lightweight, TypeScript-first approach. It provides a SQL-like query builder and superior type safety inferred directly from the database schema.
*   **Logging:** [**Pino**](https://getpino.io/) for structured and performant logging, with [**pino-pretty**](https://github.com/pinojs/pino-pretty) for human-readable logs in development.
    *   The logger is configured in `lib/logger.ts`.
    *   Import it and use it in your server-side code: `import logger from '@/lib/logger'; logger.info('Hello world');`
    *   In development, logs are prettified. In production, they are JSON formatted. The `dev` script in `package.json` is already set up to use `pino-pretty`.

## ☁️ Cloud Infrastructure

We will leverage a modern, serverless-first infrastructure to ensure scalability and cost-efficiency.

*   **Hosting:** [**Vercel**](https://vercel.com/) for hosting the Next.js application. Its seamless integration, automatic deployments, and global CDN are perfect for this project.
*   **Database:** [**Neon**](https://neon.tech/) as our serverless PostgreSQL provider. It pairs perfectly with Vercel, offering features like branching and scale-to-zero to keep costs low during development.

## 🗺️ Development Roadmap

The project will be developed in small, iterative phases to ensure we have a functional and testable product at each stage.

---

### **Phase 0: Foundation & Setup**
*The goal is to have a "Hello World" Next.js project connected to the database and deployed on Vercel.*
- [X] Initialize Next.js project with the App Router.
- [X] Install and configure Tailwind CSS.
- [X] Set up a Neon database and connect it to the Vercel project.
- [X] Install Drizzle ORM and configure it.
- [X] Create the initial database schema using Drizzle's syntax and run the first migration.
- [X] Push a basic "Welcome" page to Vercel to confirm deployment works.

---

### **Phase 1: Core Authentication**
*The goal is to allow users to sign up, log in, and log out.*
- [X] Integrate `Auth.js` into the project.
- [X] Configure the `drizzle-adapter` for `Auth.js` to manage user, session, and account tables.
- [X] Add a login provider (e.g., Google or Email).
- [X] Create a simple UI with Login/Logout buttons using Shadcn components.
- [X] Create a protected route (e.g., `/profile`) that shows the logged-in user's email and avatar.

---

### **Phase 2: The Simplest Reader (Proof of Concept)**
*The goal is to display a single, hard-coded manga chapter.*
- [X] Manually add data for **one** manga, **one** chapter, and a few pages (image URLs) into the database.
- [X] Create the reader page: `/read/[chapterId]`.
- [X] On this page, fetch the hard-coded page images for the given chapter and display them vertically.
- [X] Style the reader for a basic, clean, vertical scroll experience.

---

### **Phase 3: The "Magic" - Progress Syncing**
*The goal is to implement the core feature on our simple reader.*
- [ ] Add the `userReadingProgress` table to the Drizzle schema and migrate the database.
- [ ] On the reader page, implement an `onScroll` event listener with **debouncing**.
- [ ] Create a Next.js Server Action to receive `userId`, `chapterId`, and `scroll_position_percentage`.
- [ ] The Server Action will use Drizzle to perform an `upsert` (update or insert) into the `userReadingProgress` table.
- [ ] When the reader page loads, fetch the user's progress for that chapter and automatically scroll to the saved position.

---

### **Phase 4: Dynamic Content & Discovery**
*The goal is to move from hard-coded data to a dynamic system.*
- [ ] Create the manga detail page: `/manga/[mangaId]`.
- [ ] Implement the "on-demand" logic:
    - [ ] If a user visits a manga page that isn't in our DB, fetch its details from the "external source".
    - [ ] Save the manga and its chapter list to our own database using Drizzle.
- [ ] Display the manga's synopsis, cover, and a list of its chapters on the detail page.
- [ ] Each chapter in the list should link to its respective reader page (`/read/[chapterId]`).

---

### **Phase 5: Building the User Experience**
*The goal is to build the main navigation and user-facing pages around the core functionality.*
- [ ] Develop the Homepage, including the "Continue Reading" section. This will query the `userReadingProgress` table to show the user's most recently read manga.
- [ ] Develop the "Reading History" page in the user's personal area.
- [ ] Implement the search functionality (initially, searching only within our DB).
- [ ] Implement the Light/Dark mode toggle using Shadcn's theming system.

---

### **Future Enhancements (Post-MVP)**
*A list of features to consider after the core product is stable.*
- [ ] **Bookmarks:** Allow users to save/follow their favorite manga.
- [ ] **Reviews & Ratings:** Implement a community review system.
- [ ] **Notifications:** Set up cron jobs (e.g., Vercel Cron Jobs) and an email service (e.g., Resend) to notify users of new chapter releases for their bookmarked manga.
- [ ] **Guest Progress:** Use `localStorage` to track progress for non-logged-in users and offer to merge it upon sign-in.
- [ ] **Advanced Search:** Implement search that can query the external source directly.
- [ ] **UI/UX Polish:** Refine all layouts, add animations, and improve mobile responsiveness.
