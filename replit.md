# SafetySync.ai - OSHA Training Compliance Platform

## Overview

SafetySync.ai is an AI-powered OSHA training compliance recordkeeping and automation platform designed for EHS/Safety Managers, HR teams, and safety training consultants. The platform manages training records, expirations, certificates, and audit-ready documentation for OSHA 29 CFR 1910 and 1926 compliance. It does not provide training courses but rather tracks and manages training completion data.

The application features a marketing landing page with a GitHub-inspired dark theme and glassmorphic design, along with an authenticated dashboard for managing employees and training records.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for the UI layer
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight alternative to React Router)

**UI Component System**
- **shadcn/ui** component library (New York style variant)
- **Radix UI** primitives for accessible, unstyled components
- **Tailwind CSS** for styling with custom GitHub-inspired dark theme
- **Custom design system** with glassmorphic effects and blue ethereal glow

**Design Philosophy**
- GitHub-inspired dark theme (`#0d1117` background, `#161b22` surfaces)
- Glassmorphic cards with `backdrop-blur-xl`, `saturate(150%)`, and multi-layer blue glow shadows
- OSHA-orange gradient CTAs (`from-orange-500 to-orange-600`)
- Responsive design optimized for mobile, tablet, and desktop
- Custom elevation system with hover and active states

**State Management**
- **TanStack Query (React Query)** for server state management and caching
- **React Context** for authentication state
- Local state management with React hooks

**Key Frontend Pages**
- `/` - Landing page with hero, features, pricing, and testimonials
- `/login` - Authentication page with glassmorphic card design
- `/dashboard` - Training records overview with compliance metrics
- `/employees` - Employee management with location assignments
- `/not-found` - 404 error page

### Backend Architecture

**Server Framework**
- **Express.js** as the HTTP server
- **TypeScript** with ES modules
- Custom middleware for request logging and JSON parsing

**Authentication & Authorization**
- **JWT (JSON Web Tokens)** for stateless authentication
- **bcryptjs** for password hashing
- Bearer token authentication via Authorization headers
- Session management with 7-day token expiration
- Auth middleware protecting API routes

**API Design**
- RESTful API endpoints under `/api` prefix
- Auth routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Resource routes: `/api/employees`, `/api/locations`, `/api/training-records`
- Query parameters for filtering (e.g., expiring records by days)
- Consistent error handling with JSON responses

**Business Logic Layer**
- Storage abstraction through `IStorage` interface
- `DbStorage` implementation for database operations
- Separation of concerns between routes, storage, and auth layers

### Data Storage

**Database**
- **PostgreSQL** via Neon serverless
- **Drizzle ORM** for type-safe database queries
- WebSocket-based connection pooling via `@neondatabase/serverless`

**Schema Design**
- `users` - Authentication and user profiles
- `companies` - Multi-tenant company records
- `locations` - Work sites/facilities per company
- `employees` - Worker records with location assignments
- `training_records` - OSHA training completion tracking

**Key Relationships**
- Users belong to companies (multi-tenant architecture)
- Employees belong to companies and locations
- Training records belong to employees
- All tables use UUID primary keys with `gen_random_uuid()`

**Data Validation**
- Zod schemas generated from Drizzle schema definitions
- Runtime validation on API endpoints
- Type safety from database to frontend

### External Dependencies

**Third-Party Services**
- **Neon Database** - Serverless PostgreSQL hosting
- **Google Fonts** - Inter and JetBrains Mono font families

**Development Tools**
- **Replit** platform integration with cartographer and dev banner plugins
- **tsx** for TypeScript execution in development
- **esbuild** for production server bundling
- **drizzle-kit** for database migrations

**UI Component Libraries**
- **Radix UI** - 25+ accessible component primitives
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **tailwind-merge** - Tailwind class merging utility

**Form Management**
- **React Hook Form** with `@hookform/resolvers`
- Zod schema validation integration

**Utility Libraries**
- **date-fns** - Date manipulation and formatting
- **clsx** - Conditional class name construction
- **nanoid** - Unique ID generation

**Session Storage**
- **connect-pg-simple** - PostgreSQL session store (dependency present but JWT used instead)