# LinkToLawyers - Legal Services Marketplace

## Overview
LinkToLawyers is a web application that connects clients with qualified attorneys and enables fee comparison nationwide. It features an AI-powered smart matching system for finding legal representation with transparent pricing. The project aims to simplify access to legal services and provide clear pricing information to users.

## User Preferences
Preferred communication style: Simple, everyday language.

### Admin Dashboard Navigation Design Pattern
- All admin dashboard pages should use centered navigation titles
- Navigation layout: Left (Back button) - Center (Page title) - Right (Empty space balancer with w-32)
- Use `justify-between` with three-column layout for consistent centering
- Back button should navigate to `/admin-dashboard` with ArrowLeft icon
- Title should be `text-xl font-semibold text-gray-900`
- Apply this pattern to all future admin dashboard pages without requiring manual updates

## System Architecture
### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom CSS variables
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Design Principles**: Mobile-first responsive design, consistent UI/UX across English and Spanish interfaces. Admin dashboard follows a uniform card design system with consistent layouts, loading states, and error handling. Legal document systems and email templates are dynamically loaded from the database for content management.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **API Design**: RESTful APIs with `/api` prefix

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe queries and schema management (Drizzle Kit)
- **Session Storage**: PostgreSQL-backed session store
- **Schema**: Includes tables for users, legal requests, attorney assignments, quotes, cases, attorney notes, blog posts, SMTP settings, and email history. Legal request forms have been streamlined, removing `urgency_level` and `budget_range` fields.

### Key Architectural Decisions
1.  **Monorepo Structure**: Shared schema and types between frontend and backend.
2.  **Type Safety**: Full TypeScript implementation with strict configuration.
3.  **Modern Tooling**: Vite for frontend, esbuild for backend compilation.
4.  **Component Library**: shadcn/ui for consistent, accessible components.
5.  **Database Strategy**: Drizzle ORM for type-safe database operations.
6.  **Session Management**: PostgreSQL-backed sessions for scalability.
7.  **API Design**: RESTful endpoints with consistent error handling.
8.  **Development Experience**: Hot reloading, type checking, and modern development tools.
9.  **Email System**: Comprehensive email template system fetching content from the database.
10. **Attorney Workflow**: End-to-end attorney management including onboarding, referral assignments, quote management (submission, editing, acceptance/decline), and case state tracking. Automated email notifications for assignments and confirmations.
11. **Localization**: External JSON-based translation system (`translations/en.json` and `translations/es.json`) for all landing pages and quote modal content. Prevents translation overwrites during deployment. Translation utility functions in `client/src/lib/translations.ts` load and build flow configurations dynamically. Spanish landing page and modal use URL-based language detection (`/es` prefix). Background translation services handle database-stored blog content. Structured intake flows include: Final Asylum (11 screens), K-1 Fiancé(e) Visa - Petitioner (10 screens), and K-1 Fiancé(e) Visa - Beneficiary (9 screens), all with full conditional navigation and bilingual support.
12. **Content Management**: Blog system with full-page editor and public display.
13. **Cloud Storage**: Production-ready image storage using Replit Object Storage with proper ACL policies for blog images. Includes SimpleImageUploader component with drag-and-drop functionality, multipart upload handling via multer, image serving endpoints, and URL normalization utilities. Updated from complex Uppy-based system to a more reliable direct upload approach.
14. **AI Chatbot System**: Comprehensive streaming chatbot with OpenAI GPT-4o integration, dedicated chat page with sticky header/footer design, real-time streaming responses, conversation persistence, and admin prompt management. Features professional UX with proper message bubbles, timestamps, typing indicators, and suggested conversation starters.

## External Dependencies
### Core Dependencies
-   `@neondatabase/serverless`: Serverless PostgreSQL connection.
-   `@radix-ui/*`: Accessible UI component primitives.
-   `@tanstack/react-query`: Server state management.
-   `drizzle-orm`: Type-safe database ORM.
-   `express`: Web application framework.
-   `react`: Frontend framework.
-   `tailwindcss`: Utility-first CSS framework.
-   `typescript`: Type safety and development experience.
-   `SMTP2GO`: Email service for notifications and confirmations.
-   `OpenAI GPT-4`: Used for background translation services for blog content.
-   `ReactQuill`: Rich text editor for blog post management.

### Development Dependencies
-   `vite`: Build tool and development server.
-   `tsx`: TypeScript execution for Node.js.
-   `esbuild`: Fast JavaScript bundler for production builds.