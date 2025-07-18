# LinkToLawyers - Legal Services Marketplace

## Overview

LinkToLawyers is a modern web application that connects clients with qualified attorneys and enables comparison of legal fees nationwide. The platform features an AI-powered smart matching system designed to help users find the right legal representation while providing transparency in legal service pricing.

## User Preferences

Preferred communication style: Simple, everyday language.

### Admin Dashboard Navigation Design Pattern
- All admin dashboard pages should use centered navigation titles
- Navigation layout: Left (Back button) - Center (Page title) - Right (Empty space balancer with w-32)
- Use `justify-between` with three-column layout for consistent centering
- Back button should navigate to `/admin-dashboard` with ArrowLeft icon
- Title should be `text-xl font-semibold text-gray-900`
- Apply this pattern to all future admin dashboard pages without requiring manual updates

## Recent Changes

- **Complete Spanish Website Implementation with Two-Domain Deployment Setup** (July 18, 2025): Successfully created comprehensive Spanish version with full deployment configuration
  - Created complete client-spanish/ folder structure with all necessary components, contexts, and utilities
  - Translated entire home page including hero section, navigation, forms, and footer content
  - Built NavbarSpanish component with English redirect button linking to linkto-lawyers.com
  - Implemented Spanish App.tsx with routing and 404 page translated to Spanish
  - Created Spanish index.html with proper SEO meta tags and Spanish language attributes
  - Translated all UI elements: form fields, buttons, validation messages, modal dialogs
  - Maintained functionality: legal request form, case type selection, email confirmation system
  - Architecture: Single backend serving both English (client/) and Spanish (client-spanish/) frontends
  - **Deployment Configuration**: Created complete two-domain deployment setup
    - English version deployment files: .replit-english, main package.json, vite.config.ts
    - Spanish version deployment files: .replit-spanish, package-spanish.json, vite-spanish.config.ts
    - Individual client-spanish/ configuration: package.json, vite.config.ts, tailwind.config.js, tsconfig.json
    - DEPLOYMENT_GUIDE.md with comprehensive deployment instructions
  - **Language Toggle Implementation**: Added "Español" button to English navbar (desktop and mobile)
  - **Production Ready**: Both versions ready for deployment to linkto-lawyers.com and linkto-abogados.com
  - **Access**: Spanish version accessible at /es route in development for testing

- **Attorney Assignment Email Template Integration** (July 18, 2025): Successfully implemented production email templates for attorney assignment notifications
  - Fixed method name error (getCaseTypes → getAllCaseTypes) that was preventing email sending
  - Corrected template type lookup from 'attorney_assignment' to 'notification' to match database configuration
  - Updated attorney assignment email function to use emailTemplateService with proper template variable processing
  - System now automatically uses admin-configured email templates for attorney notifications
  - Each attorney receives separate personalized emails with their name in the subject line
  - Template variables are properly replaced with actual case data (attorney name, case details, client info)
  - Verified working: Attorney assignment emails now use production templates with all modifications reflected

- **Legal Request Form UX Improvements** (July 18, 2025): Enhanced form submission and cancellation behavior
  - Fixed prefill checkbox reset issue - now properly clears after form submission
  - Added cancel confirmation dialog with warning message about data deletion
  - Improved confirmation modal behavior - keeps success message visible until user manually closes it
  - Enhanced user experience with proper form state management and clear feedback
  - Maintained production email template system integration with automatic confirmation emails

- **Production Email Template System** (July 18, 2025): Implemented automatic use of admin-configured email templates
  - Fixed legal request form to automatically use production email templates from database
  - Modified form submission to call confirmation email API with proper template variable processing
  - Added proper error handling and user feedback for email sending success/failure
  - System now automatically processes template variables and sends confirmation emails using admin-configured templates
  - Eliminated hardcoded email templates in favor of dynamic database-driven template system

- **Dedicated Blog Header System** (July 17, 2025): Created separate header component for blog pages with independent navigation
  - Built BlogHeader component with authentication, mobile menu, and navigation functionality
  - Main blog listing page (/blog) includes back button to return to home page
  - Individual blog post pages use clean header without back button
  - Separated blog navigation from main site navbar to maintain home page functionality
  - Fixed JavaScript error with setIsMenuOpen in home page by removing improper state reference
  - Maintained consistent authentication flow and responsive design across blog pages

- **Full-Page Blog Editor Implementation** (July 17, 2025): Replaced modal-based blog creation with full-page editor featuring rich text editing
  - Created dedicated BlogPostEditor component with ReactQuill rich text editor
  - Added routes for /blog-management/create and /blog-management/edit/:id
  - Implemented comprehensive formatting toolbar with headers, text formatting, lists, alignment, colors, and code blocks
  - Fixed toolbar duplication issues by simplifying configuration
  - Added proper form validation and navigation between blog management and editor pages
  - Maintained admin authentication requirements for blog post creation and editing

- **Blog System Implementation** (July 17, 2025): Built comprehensive blog management system with public and admin functionality
  - Created blog_posts database table with title, slug, content, excerpt, publish status, author, and SEO metadata
  - Implemented complete backend API with blog post CRUD operations (create, read, update, delete, publish/draft)
  - Built admin blog management page with professional interface, form validation, and statistics dashboard
  - Created public blog listing page with responsive card layout and search functionality
  - Added individual blog post detail pages with professional formatting and navigation
  - Integrated blog management card into admin dashboard with post metrics and recent posts preview
  - Added blog navigation links to main navbar (both desktop and mobile menus)
  - Implemented publish/draft workflow with proper status tracking and date management
  - Added slug generation from titles with URL-friendly formatting
  - System supports rich content display with proper typography and responsive design

- **Professional Email Template Enhancement** (July 17, 2025): Enhanced attorney assignment emails with professional inline CSS styling
  - Redesigned email template with modern HTML structure and comprehensive inline CSS styling
  - Added branded header with LinkToLawyers logo and professional color scheme
  - Implemented card-based layout with color-coded sections (blue for case info, yellow for details, green for additional info)
  - Added responsive design with proper typography, spacing, and visual hierarchy
  - Enhanced data presentation with styled badges, clickable contact links, and formatted dates
  - Included professional call-to-action button and branded footer
  - Improved mobile compatibility and cross-email client support
  - All styling uses inline CSS for maximum email client compatibility

- **Attorney Assignment System** (July 17, 2025): Built comprehensive attorney assignment functionality for legal requests
  - Created request_attorney_assignments database table with assignment tracking and status management
  - Added API routes for attorney assignment: get attorneys by case type, assign attorneys to requests, update assignment status
  - Implemented attorney assignment modal in request management with case type-specific attorney filtering
  - Added "Assign Attorneys" button to request details modal for streamlined workflow
  - System shows attorneys with their fee schedules, verification status, and experience for informed assignment decisions
  - Supports bulk attorney assignment with optional notes and real-time status updates
  - Integrated with existing attorney fee schedule system to show relevant pricing information

- **Uniform Admin Card Design System** (July 17, 2025): Created consistent card format across all admin dashboard components
  - Built AdminCard base component with standardized layout (title, description, icon, content area, action button)
  - Implemented consistent loading states, error handling, and hover effects
  - Updated all admin cards to use uniform design pattern: SmtpStatusCard, RequestManagementCard, AttorneyOnboardingCard, AttorneyFeeScheduleCard
  - Standardized card structure with icon colors, badge usage, and grid layouts for metrics
  - Consistent spacing, typography, and visual hierarchy across all dashboard cards
  - Added hover shadow effects and professional styling for improved user experience

- **Attorney Onboarding System** (July 17, 2025): Built comprehensive attorney management system with full CRUD functionality
  - Created attorneys database table with complete profile information (name, email, phone, bar number, license state, practice areas, experience, hourly rate, firm details, bio, verification status)
  - Added attorney API routes with admin-only authentication for create, read, update, delete operations
  - Built AttorneyOnboarding page with professional table interface and advanced filtering (by state, verification status, search)
  - Implemented detailed attorney profile modals with view, edit, and delete functionality
  - Added practice areas selection with 15 legal specialties and US states dropdown
  - Created AttorneyOnboardingCard component for admin dashboard with attorney statistics
  - Added attorney verification system with visual indicators and status badges
  - Integrated attorney routing and navigation throughout admin interface
  - System tracks attorney creation, updates, and verification status with timestamps

- **Legal Request Status Management System** (July 17, 2025): Implemented comprehensive status tracking for legal requests
  - Added status field to legal requests table with default "under_review" status
  - Created statusCodes.ts utility with 12 status codes covering complete legal service workflow
  - Status codes include: under_review, attorney_matching, quotes_requested, quotes_received, awaiting_client_response, client_reviewing, attorney_selected, case_assigned, completed, on_hold, cancelled, expired
  - Added status badges and color coding to admin dashboard table and request tracking modal
  - Implemented status dropdown in admin edit modal with full workflow state transitions
  - Added status descriptions and color-coded badges for improved user experience
  - Status system provides clear tracking from initial submission through completion
  - Migrated database schema to include status field with proper default values

- **Authentication Flow Improvements** (July 17, 2025): Updated login/logout navigation behavior
  - Users are now redirected to admin dashboard immediately after successful login
  - Home page hides user dropdown menu and redirects authenticated users to dashboard
  - Logout from dashboard properly redirects users back to home page
  - Added hideUserDropdown prop to Navbar component for flexible user menu display
  - Improved user experience by preventing authenticated users from staying on public home page

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