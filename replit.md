# LinkToLawyers - Legal Services Marketplace

## Overview

LinkToLawyers is a modern web application that connects clients with qualified attorneys and enables comparison of legal fees nationwide. The platform features an AI-powered smart matching system designed to help users find the right legal representation while providing transparency in legal service pricing.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Request Management Bulk Delete Feature** (July 17, 2025): Added bulk delete functionality to legal requests management
  - Added checkboxes for individual request selection and select-all functionality
  - Implemented bulk delete button that appears when requests are selected
  - Created bulk delete confirmation modal with list of selected requests
  - Added bulk delete mutation that handles multiple simultaneous deletions
  - Updated table UI to include selection column with proper accessibility labels
  - Added proper state management for selected request IDs and bulk operations

- **Legal Request Confirmation Email System** (July 17, 2025): Built complete email confirmation system for legal form submissions
  - Created professional HTML email templates with request summary and next steps information
  - Implemented email preview modal with HTML and plain text tabs for admin review
  - Added email override functionality for testing with linktolawyers.us@gmail.com
  - Integrated automatic email sending after successful form submission
  - Added email history tracking and comprehensive error handling
  - Updated confirmation modal to indicate email sent and remind users to check spam folders
  - Removed prefill checkbox from confirmation modal and fixed form reset issues

- **SMTP2GO Email Configuration System** (July 17, 2025): Implemented comprehensive email service configuration
  - Replaced admin dashboard metric cards with full-featured SMTP2GO configuration interface
  - Added database tables for smtp_settings and email_history with proper schema validation
  - Built tabbed interface with Settings, Test, and History sections for complete email management
  - Implemented connection testing, email sending, and history tracking with proper error handling
  - Added rate limiting (10 emails per 15 minutes) and admin-only authentication protection
  - Fixed authentication system to properly send Bearer tokens for API requests
  - Integrated with SMTP2GO service using correct port 2525 configuration (secure: false, requireTLS: true)
  - Added comprehensive email history tracking with success/failure status and error messages

- **Navbar Component Creation** (July 17, 2025): Extracted header into reusable Navbar component
  - Created separate Navbar.tsx component with sticky positioning and authentication integration
  - Moved all navigation logic from home.tsx to dedicated component for better code organization
  - Maintained responsive design with mobile menu functionality
  - Integrated user authentication state with dropdown menu for logged-in users
  - Component accepts activeSection, scrollToSection, and setIsLoginModalOpen as props for flexibility

- **Case Type Categorization System** (July 16, 2025): Implemented comprehensive legal case type dropdown system
  - Created hierarchical PostgreSQL database structure for case types with parent/child relationships
  - Built complete backend infrastructure with API routes, storage methods, and automated seeding
  - Implemented 11 professional immigration law categories with bilingual support (English/Spanish)
  - Replaced basic category dropdown with sophisticated case type system showing detailed subcategories
  - Added case types: Family-Based Immigrant Visa (Immediate Relative, Family Preference, Waivers), K-1 Fiancé Visa, Citizenship & Naturalization (N-400, N-600), Asylum (Affirmative, Defensive), Deportation Defense, VAWA, and Other
  - Each case type includes detailed descriptions to help users identify their specific legal needs
  - System automatically seeds missing case types on server startup for data consistency

- **UI/UX Improvements** (July 16, 2025): Enhanced hero section layout and image updates
  - Updated thinking girl image to show realistic law firm pricing ($1,200, $1,750, $2,500)
  - Implemented equal-width, equal-height hero section columns with balanced layout
  - Added call-to-action button positioned at bottom of left column for visual alignment
  - Enhanced content flow with additional paragraph above button for better spacing
  - Improved responsive design for better mobile and desktop experience

- **Free Resources and Help Pages** (July 16, 2025): Created comprehensive resource and support pages
  - Built dedicated Free Resources page with downloadable guides and webinars
  - Created Help & Support page with FAQ, contact forms, and support options
  - Added proper routing for /free-resources and /help pages
  - Updated navigation links to route to dedicated pages instead of scrolling sections
  - Maintained consistent authentication and UI design across all pages

- **Authentication System Implementation** (July 16, 2025): Built complete role-based authentication system with email/password
  - Updated database schema to include email, firstName, lastName, role, createdAt, updatedAt fields
  - Implemented three user roles: client, attorney, and admin
  - Created authentication routes: register, login, logout, and protected routes
  - Added password hashing using bcrypt for security
  - Built React authentication context with login/logout functionality
  - Updated navbar to show "Sign In" instead of "Free Quote" with user dropdown menu
  - Created admin dashboard with navbar, user avatar, and account dropdown
  - Added responsive authentication UI for both desktop and mobile
  - Test admin user created: admin@linkto.lawyers (password: admin123)

- **Database Migration** (July 16, 2025): Successfully migrated from in-memory storage to PostgreSQL database using Neon Database
  - Created PostgreSQL database with environment variables (DATABASE_URL, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST)
  - Updated storage implementation from MemStorage to DatabaseStorage using Drizzle ORM
  - Database schema pushed successfully with `npm run db:push`
  - All user data now persists in PostgreSQL instead of memory

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Hookform Resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **API Design**: RESTful APIs with `/api` prefix

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Migrations**: Drizzle Kit for database schema management
- **Session Storage**: PostgreSQL-backed session store

## Key Components

### Frontend Components
- **Pages**: Home page with legal services marketplace features, 404 error page
- **UI Library**: Comprehensive set of reusable components (buttons, forms, modals, etc.)
- **Query Client**: Configured for API communication with error handling
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Components
- **Express Server**: Main application server with middleware for JSON parsing and logging
- **Route Handler**: Centralized route registration system
- **Storage Interface**: Abstract storage layer with PostgreSQL database implementation using Drizzle ORM
- **Development Tools**: Hot reloading with Vite integration in development mode

### Database Schema
- **Users Table**: Basic user management with username/password authentication
- **Schema Validation**: Zod integration for type-safe data validation
- **Type Generation**: Automatic TypeScript type generation from schema

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Processing**: Express server handles requests through registered routes
3. **Data Layer**: Storage interface abstracts database operations
4. **Response Handling**: Structured JSON responses with error handling
5. **State Updates**: React Query manages cache invalidation and updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database ORM
- **express**: Web application framework
- **react**: Frontend framework
- **tailwindcss**: Utility-first CSS framework
- **typescript**: Type safety and development experience

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with hot module replacement
- **Backend**: tsx for TypeScript execution in development
- **Database**: Drizzle push for schema synchronization

### Production Build
- **Frontend**: Vite build with optimized bundle output to `dist/public`
- **Backend**: esbuild compilation to `dist/index.js`
- **Database**: Environment-based configuration with DATABASE_URL

### Environment Configuration
- **Development**: NODE_ENV=development with local development tools
- **Production**: NODE_ENV=production with optimized builds
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Key Architectural Decisions

1. **Monorepo Structure**: Shared schema and types between frontend and backend
2. **Type Safety**: Full TypeScript implementation with strict configuration
3. **Modern Tooling**: Vite for frontend, esbuild for backend compilation
4. **Component Library**: shadcn/ui for consistent, accessible components
5. **Database Strategy**: Drizzle ORM for type-safe database operations
6. **Session Management**: PostgreSQL-backed sessions for scalability
7. **API Design**: RESTful endpoints with consistent error handling
8. **Development Experience**: Hot reloading, type checking, and modern development tools