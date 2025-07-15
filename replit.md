# LinkToLawyers - Legal Services Marketplace

## Overview

LinkToLawyers is a modern web application that connects clients with qualified attorneys and enables comparison of legal fees nationwide. The platform features an AI-powered smart matching system designed to help users find the right legal representation while providing transparency in legal service pricing.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Storage Interface**: Abstract storage layer with in-memory implementation for development
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