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

- **Attorney Dashboard Tab Restructure and Accepted Quotes Implementation** (July 20, 2025): Updated attorney dashboard with new tab structure and assignment status workflow
  - Removed Profile tab from attorney dashboard (no longer needed)  
  - Added new "Accepted Quotes" tab between "My Referrals" and "Active Cases"
  - Implemented new "accepted" assignment status that gets set when client accepts a quote
  - Updated quote acceptance workflow: when quote is accepted, assignment status changes from "quoted" to "accepted"
  - Enhanced MyReferralsList component with filterStatus prop to show only accepted quotes in new tab
  - Quote status badges now properly display in attorney interface with color coding (green=accepted, red=declined, yellow=pending)
  - Updated backend route to automatically update assignment status when quote status changes
  - Attorney dashboard now follows: Overview → Available Referrals → My Referrals → Accepted Quotes → Active Cases

- **Database Schema Cleanup - urgency_level and budget_range Fields Removal** (July 20, 2025): Completed comprehensive removal of urgency_level and budget_range fields from entire system
  - Removed fields from legal_requests database table schema (verified columns don't exist)
  - Updated shared/schema.ts to remove fields from insertLegalRequestSchema
  - Fixed TrackRequestModal and TrackRequestModalSpanish interfaces to remove urgencyLevel and budgetRange
  - Removed getUrgencyBadge and getBudgetRange functions and their usage from track request modals
  - Updated emailTemplateService.ts functions to remove urgency/budget variable processing
  - Cleaned email templates in client/src/lib/emailTemplates.ts to remove urgency/budget content from both HTML and plain text
  - Eliminated all code references to these deprecated fields preventing database column errors

- **Quote Accept/Decline System Implementation** (July 20, 2025): Built comprehensive quote acceptance/decline workflow with confirmation dialogs
  - Added "Accept Quote" and "Decline Quote" buttons to quote details in both English and Spanish track request modals
  - Implemented confirmation dialogs with clear messaging for both accept and decline actions
  - Created backend API endpoint `/api/attorney-referrals/quotes/:quoteId/status` for updating quote status
  - Added automatic declining of other quotes when one is accepted to prevent conflicts
  - Quote statuses: "Pending", "Accepted", "Declined" with proper visual indicators and color coding
  - Real-time UI updates with toast notifications and cache invalidation for seamless user experience
  - Bilingual support with Spanish translations for all quote management functionality

- **Status Code Implementation** (July 19, 2025): Implemented Option 1 status flow for better user experience
  - Request status changes from "Under Review" to "Quotes Available" when first attorney submits quote
  - Status remains "Quotes Available" as additional attorneys submit quotes (no distinction between 1 or multiple quotes)
  - Users see clear indication that quotes are ready for review regardless of quantity
  - Simplified workflow: Submit → Under Review → Quotes Available → User Decision

- **Database Schema Cleanup** (July 19, 2025): Removed unnecessary fields from legal requests system
  - Removed urgency_level and budget_range columns from legal_requests table
  - Updated schema to exclude these fields for cleaner data model
  - Cleaned up admin interface by removing urgency and budget columns from request management table

- **Modal State Management Fix** (July 19, 2025): Resolved stuck modal header issues across attorney dashboard
  - Fixed Dialog components in both MyReferralsList and ReferralList to use controlled open state
  - Added proper onOpenChange handlers to clear selectedReferral state when modals close
  - Eliminated "Referral Details -" header that remained on screen after quote submission or assignment
  - Removed duplicate toast notification that created impression of multiple popups in quote submission
  - Reorganized fee schedule loading to occur before modal opens, eliminating visual flicker
  - Enhanced quote submission workflow to automatically close both quote modal and referral details modal
  - Improved cache invalidation to refresh Available Referrals tab when attorney unassigns after creating quotes
  - All modal interactions now provide clean, professional user experience without UI artifacts

- **Attorney Self-Management System Implementation** (July 19, 2025): Built comprehensive attorney self-management functionality with quote editing capabilities
  - Added backend API endpoints for attorney self-unassignment with automatic quote deletion when unassigning with existing quotes
  - Created Edit Quote and Delete Quote buttons that appear for attorneys with submitted quotes (status 'quoted')
  - Added warning dialog for unassignment showing quote deletion warning when applicable with clear messaging
  - Built quote management system with proper validation, error handling, and real-time UI updates
  - Added new API route `/api/attorney-referrals/assignment/:assignmentId/quotes` for fetching attorney's quotes by assignment
  - System allows attorneys to: unassign themselves from referrals, edit submitted quotes, delete quotes independently
  - Fixed JSON parsing errors in quote fetching by handling empty responses properly with text-first parsing
  - Fixed timestamp format issue in quote deletion by changing toISOString() to new Date() for proper database compatibility
  - Reorganized UI to move all action buttons into the View Referral Details popup for cleaner table interface

- **Public Quote Display Integration** (July 19, 2025): Connected attorney dashboard quotes to public track request functionality
  - Created public API endpoint `/api/attorney-referrals/public/request/:requestId/quotes` to fetch quotes for tracking without authentication
  - Updated TrackRequestModal to display attorney quotes with condensed card format showing fee, experience, and credentials
  - Implemented expandable quote details with full attorney profile, service description, terms, and contact information
  - Added bilingual support for quote display in both English and Spanish track request modals
  - Created collapsible interface allowing users to compare multiple attorney quotes efficiently
  - Integrated verification badges and firm information display for attorney credibility
  - Quotes appear automatically when attorneys submit them through the referral management system
  - Users can now see all available quotes when tracking their request using the request number

- **Attorney Fee Schedule Auto-Population System** (July 19, 2025): Implemented automatic fee schedule lookup and pre-population for attorney quotes
  - Created API endpoint `/api/attorney-referrals/fee-schedule/:caseType` to fetch attorney's configured fees for specific case types
  - Updated quote submission form to automatically check attorney's fee schedule when quote modal opens
  - Added visual indicators in quote form showing when fee schedule data is applied with blue notification banner
  - Implemented form pre-population with attorney's flat fee, fee type, and description from fee schedule
  - Fixed validation errors in quote submission by properly handling optional validUntil date field with string-to-date transformation
  - Updated attorney lookup logic in quote routes to use userId-to-attorneyId mapping for proper authorization
  - Added automatic form cleanup when canceling or completing quotes to prevent data persistence issues
  - System now seamlessly integrates fee schedules: when James Mueller quotes family-based cases, form pre-populates with his $3,500 flat fee

- **Attorney Referral Management System Implementation** (July 19, 2025): Built complete attorney referral management workflow
  - Extended database schema with referral_assignments, information_requests, quotes, cases, and attorney_notes tables
  - Created comprehensive backend API routes for attorney referral management with authentication middleware
  - Built frontend components (ReferralList, MyReferralsList) for browsing and managing referrals
  - Updated attorney dashboard with tabbed interface for referral workflow management
  - Fixed Select component errors and implemented proper query parameter handling
  - Created attorney profiles for James L. Mueller Jr. and Jim Mueller with proper user account linking
  - Fixed foreign key constraint issues by adding user_id field to attorneys table and updating backend routes
  - Fixed JSON parsing errors in fee schedule and attorney creation forms by removing double JSON.stringify
  - System ready for testing with 1 available unassigned legal request in database

- **Attorney Dashboard Implementation** (July 19, 2025): Created comprehensive attorney dashboard system with role-based authentication
  - Built AttorneyAppBar component with user dropdown menu, profile access, and bilingual Spanish interface
  - Created attorney-dashboard page with blank content area ready for future development
  - Updated authentication system to redirect attorneys to /attorney-dashboard upon login
  - Added proper role-based access control preventing unauthorized dashboard access
  - Integrated attorney dashboard routing into main App.tsx with /attorney-dashboard path
  - Dashboard features welcome message, construction placeholder, and professional layout matching admin dashboard design patterns

- **Database-Driven Legal Document System** (July 19, 2025): Completed integration of email template system with modal legal documents
  - Updated Terms and Conditions and Privacy Policy modals to fetch content from database templates
  - Implemented dynamic template loading based on language (terms_conditions, privacy_policy, terms_conditions_spanish, privacy_policy_spanish)
  - Added proper loading states and error handling for modal content fetching
  - Enhanced validation to allow text-only content without requiring HTML for legal document templates
  - Added clear template type descriptors distinguishing email templates from document templates  
  - Fixed form reset bug ensuring all fields clear completely when creating new templates
  - Fixed server-side schema validation error preventing template updates with separate update schema
  - Created comprehensive admin workflow for managing both email templates and legal document content

- **Form Field Updates** (July 19, 2025): Streamlined legal request forms by removing unnecessary fields and improving validation
  - Removed urgency level field (radio buttons) from both English and Spanish forms
  - Removed budget range field (dropdown) from both English and Spanish forms
  - Made phone number field optional with updated labels "Phone Number (Optional)" and "Número de Teléfono (Opcional)"
  - Added 100 character minimum requirement for case description with real-time character counter
  - Updated prefill data and form state management to reflect simplified field structure
  - Enhanced user experience with streamlined form flow and clear validation feedback
  - Updated Spanish confirmation email template to match English version changes and removed obsolete fields
  - Fixed email template cache issue by setting staleTime: 0 and adding refresh button for real-time data updates
  - Added Spanish template type options (legal_request_confirmation_spanish) to admin dropdown for proper template management
  - Updated "Track Your Request" popup text from "You'll receive personalized quotes within 24-48 hours" to "You'll receive personalized quotes" in both English and Spanish versions
  - Created modal popup system for Terms and Conditions and Privacy Policy links in both English and Spanish request forms
  - Added TermsAndConditionsModal and PrivacyPolicyModal components with bilingual support (isSpanish parameter)
  - Converted static links to clickable buttons that open respective modal dialogs
  - Modal system ready for content insertion with proper scrollable areas and responsive design
  - Updated Terms and Conditions modal with complete legal content from provided document (2024-08-25)
  - Enhanced modal scrolling functionality with fixed header/footer and scrollable content area
  - Improved modal layout with flex structure for optimal content display and user experience

- **Spanish Case Type Translation System** (July 19, 2025): Implemented comprehensive Spanish translations for case type dropdown in legal request forms
  - Updated HierarchicalCaseTypeSelect component to support Spanish translations with isSpanish parameter
  - Added Spanish translations for all case type labels and descriptions in database
  - Created category translation system for hierarchical dropdown categories
  - Spanish form now displays case types in Spanish: "Visa de Inmigrante Basada en Familia - Pariente Inmediato" etc.
  - Updated form prefill with correct database case type values
  - Categories translated: "Inmigración Basada en Familia", "Ciudadanía y Naturalización", "Asilo", etc.

- **Navigation Hover Style Enhancement** (July 19, 2025): Updated navigation hover styles with improved rounded corners
  - Changed navigation links from rounded-md to rounded-lg for more prominent rounded corners
  - Applied consistent styling across both English and Spanish navbars
  - Updated desktop and mobile navigation menus
  - Enhanced visual feedback with light gray background and better rounded button appearance

- **Spanish Hero Image Update** (July 19, 2025): Applied final Spanish-specific hero image with professional formatting
  - Updated Spanish homepage to use girl-final_spanish_1752931654981.png image
  - Image displays "Abogada A/B/C" with US dollar pricing for Spanish audience
  - Maintained identical 500px width sizing for layout consistency between language versions
  - Enhanced visual representation for Spanish-speaking users

- **Homepage Content Update** (July 18, 2025): Removed AI Powered Smart Matching Algorithm paragraph from both English and Spanish homepages
  - Eliminated paragraph about "bridging the gap" and AI smart matching algorithm from hero sections
  - Content now flows directly from main headings to core value proposition about platform simplification
  - Updated both /home and /es/ homepages for consistency across languages

- **Database-Stored Translation System Implementation** (July 18, 2025): Completed migration from real-time to database-stored translations for optimal performance
  - Updated database schema with Spanish translation columns (spanishTitle, spanishContent, spanishExcerpt, translationStatus)
  - Created background translation service using OpenAI GPT-4 for high-quality legal content translation
  - Updated Spanish blog API routes to use stored translations instead of real-time translation (eliminated 5-6 second load times)
  - Added automatic translation triggers when posts are published or updated
  - Background service processes translation queue every 5 minutes and on server startup
  - Spanish blog pages now load under 1 second with pre-translated database content
  - System shows "Traducción en proceso" fallback message until translations complete

- **Auto-Translation Blog System Implementation** (July 18, 2025): Built complete auto-translation functionality for blog posts using OpenAI API
  - Created translation service using OpenAI GPT-4 for high-quality legal content translation
  - Added Spanish blog API endpoints that automatically translate English posts to Spanish
  - Built Spanish blog listing page at /es/blog with black hero section and clean white card layout
  - Created Spanish blog post detail pages at /es/blog/:slug with black header section and white content area
  - Implemented caching system to avoid repeated API calls for same content
  - Added fallback handling for translation failures with graceful error messages
  - Integrated Spanish blog navigation into existing Spanish navbar
  - System allows writing once in English with automatic Spanish display for bilingual audience

- **Spanish Help Page Implementation** (July 18, 2025): Created comprehensive Spanish help and support page
  - Built HelpSpanish component with complete Spanish translations for all help content
  - Added route /es/ayuda for Spanish help page access
  - Translated support options: Chat en Vivo, Soporte Telefónico, Soporte por Email
  - Comprehensive FAQ section translated with 8 common immigration questions and answers
  - Contact form completely translated: field labels, categories, placeholders, and validation
  - Support categories translated: Pregunta General, Problema Técnico, Pregunta de Facturación, etc.
  - Navigation properly integrated with existing Spanish navbar (desktop and mobile)
  - Links to Spanish free resources page for additional help options

- **Spanish Free Resources Page Implementation** (July 18, 2025): Created complete Spanish version of free resources page
  - Built FreeResourcesSpanish component with full Spanish translations
  - Added route /es/recursos-gratuitos for Spanish free resources access
  - Translated all content: titles, descriptions, categories, and call-to-action sections
  - Includes Spanish translations for resource categories: Guías Legales, Listas de Verificación, Infografías, Referencia
  - Webinar section translated: Seminarios Web Educativos with Spanish duration and view counts
  - Navigation links properly integrated with Spanish homepage navbar
  - Maintains same functionality as English version with complete Spanish localization

- **Navbar Button Style Updates** (July 18, 2025): Updated button styles across both English and Spanish homepages
  - English homepage: Sign In button changed to white background with black text; Español button changed to black background with white text
  - Spanish homepage: English button changed to black background with white text for prominent visibility
  - Updated both desktop and mobile menu versions for consistency across all pages
  - Enhanced visual emphasis on language switching options

- **Complete Spanish Track Request Functionality** (July 18, 2025): Built comprehensive Spanish request tracking system
  - Created TrackRequestModalSpanish component with complete Spanish translations
  - Added Spanish status translations to statusCodes.ts with getStatusInfoSpanish helper
  - Implemented Spanish date formatting using date-fns/locale
  - Translated all UI elements including "Rastrea Tu Solicitud" button
  - Added Spanish translations for case types, urgency levels, and error messages
  - Integrated Spanish track request modal into Spanish homepage

- **Complete Spanish Legal Request Form Implementation** (July 18, 2025): Created fully functional Spanish legal request form with complete functionality
  - Built SpanishLegalRequestForm component with all form fields translated to Spanish
  - Integrated form with existing Spanish homepage at /es/ URL path
  - Added Spanish email confirmation API endpoint using existing database template (ID 4)
  - Configured testing email address (linktolawyers.us@gmail.com) for prefill functionality
  - Updated all contact email addresses from info@linktolawyers.com to support@linktolawyers.com
  - Form includes complete Spanish translations, validation, error handling, and confirmation dialogs
  - Successfully tested: form submission, database storage, and Spanish email confirmation delivery

- **Complete Spanish Translation Implementation** (July 18, 2025): Created full Spanish version of public-facing homepage accessible at /es/ URL path
  - Built complete Spanish translation of all sections: hero, value proposition, how it works, about, and footer
  - Translated hero section: "Encuentra Tu Abogado de Inmigración" with complete Spanish content
  - Created Spanish navbar with translated menu items (Cómo Funciona, Acerca de, Contáctanos, etc.)
  - Translated 4-step process section: "Cómo Funciona LinkToLawyers" with detailed Spanish explanations
  - Complete Spanish about section with mission, vision, and company introduction
  - Full Spanish footer with translated resource links, support options, and legal information
  - Added custom Spanish image showing "Law Firm A/B/C" with US$ pricing for international clarity
  - Removed authentication features from Spanish version - no Sign In button or user dropdown
  - Added bidirectional language switching between English and Spanish versions
  - Used same UI components and functionality with complete Spanish content translation
  - Spanish site focuses only on public-facing content without admin dashboard access

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

- **Custom Confirmation Dialog System** (July 18, 2025): Replaced JavaScript alerts with professional custom confirmation dialogs
  - Created reusable ConfirmDialog component using Radix UI AlertDialog primitives
  - Replaced window.confirm alerts in blog management page with custom delete confirmation dialog
  - Replaced window.confirm alerts in email templates page with custom delete confirmation dialog
  - Replaced JavaScript alerts in home page with proper toast notifications for error handling
  - Added destructive styling variant for delete operations with red color scheme
  - Improved user experience with consistent, professional confirmation dialogs across admin dashboard
  - All confirmation dialogs now show specific item names and "This action cannot be undone" warnings

- **Blog Display Improvements** (July 18, 2025): Enhanced blog page user experience with cleaner content display
  - Removed help link from blog page navigation for cleaner interface
  - Fixed HTML content display issue by replacing raw HTML with user-friendly text previews
  - Implemented stripHtmlAndTruncate function to remove HTML tags and show clean excerpts
  - Blog posts now display readable content previews instead of confusing HTML markup
  - Enhanced user experience with proper content formatting and conditional rendering

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