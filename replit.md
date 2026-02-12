# SafetySync.ai - OSHA Training Compliance Platform

## Overview

SafetySync.ai is an AI-powered OSHA compliance platform designed for Safety/EHS Managers with HR collaboration support. The platform helps document training delivery, understanding evaluation, and compliance readiness through intelligent recordkeeping for OSHA 29 CFR 1910 and 1926. It is a compliance platform, not a training provider—helping teams maintain clear, audit-ready records while continuing to work with their preferred instructors and training programs.

The application features a marketing landing page with a GitHub-inspired dark theme and glassmorphic design, along with an authenticated dashboard for managing employees and training records.

## Recent Updates (February 2026)

**Admin Billing Overrides & CSR Tools (Feb 2026):**
- org_billing_overrides table: overrideType (none/discount_percent/fixed_price/comped), discountPercent, fixedPriceCents, note, startsAt, endsAt, createdByUserId
- billing_notes table: orgId, note, authorUserId, createdAt (internal billing notes)
- POST /api/admin/organizations/:orgId/billing-override (owner_admin only) - set override with audit log
- DELETE /api/admin/organizations/:orgId/billing-override (owner_admin only) - remove override with audit log
- GET /api/admin/billing/delinquent - list orgs with past_due/unpaid/canceled status
- POST /api/admin/organizations/:orgId/portal-link - generate Stripe Customer Portal link (owner_admin + csr_admin)
- GET/POST /api/admin/organizations/:orgId/billing-notes - internal billing notes (owner_admin + csr_admin)
- GET /api/admin/organizations/:orgId/billing now includes override data
- Admin console: Billing Overrides card on org detail page with form (comped/discount/fixed price)
- Admin console: Internal Billing Notes panel on org detail page
- Admin console: "Generate Portal Link" button (copies to clipboard)
- Admin console: /billing/delinquent page for delinquent accounts with portal link and view billing actions
- Admin sidebar: "Delinquent" nav item under Billing

**Products & Access Control (Feb 2026):**
- products table: slug, name, description (seeded with SafetySync, OpsSync, JSAsync, DocSync)
- org_entitlements table: orgId, productId, enabled, plan, billingSource, notes, endsAt, updatedByUserId
- GET /api/admin/products - list all products
- GET /api/admin/organizations/:orgId/entitlements - list org entitlements
- POST /api/admin/organizations/:orgId/entitlements (owner_admin only) - upsert entitlement with audit log
- Admin console: "Products Purchased" section on org billing detail page with per-product rows
- Each row: Enabled toggle, Plan dropdown, Billing Source dropdown, End Date, Notes, Save button
- owner_admin can edit; csr_admin sees read-only view with "Contact owner admin to change access" note
- Admin sidebar: "Products & Access" nav item
- Auth context extended: owner_admin vs csr_admin roles with separate mock tokens (mock-admin-token / mock-csr-token)
- Login page: separate "Sign In as Owner Admin" and "Sign In as CSR Admin" buttons

**Entitlement Enforcement (Feb 2026):**
- requireEntitlement(productSlug) middleware in server/auth.ts - checks org_entitlements by product slug
- Returns 403 with {code: "NOT_ENTITLED"} when product is disabled for org
- Applied to all SafetySync workspace routes: locations, employees, training-records (CRUD)
- GET /api/workspace/entitlements returns {orgId, entitlements map, billingStatus, trialEndsAt}
- Frontend EntitlementContext (both client/ and apps/workspace-web/) fetches entitlements on auth
- AccessBlocked page shown when safetysync entitlement is disabled
- Settings page: "Product Suite" section listing enabled/disabled products with plan badges
- Dev-mode fallback: mock-token (org-1 not in DB) gets safetysync enabled by default
- Storage methods: isOrgEntitledToProduct(orgId, slug), getOrgEntitlementsWithProducts(orgId)

**Stripe Billing Integration:**
- Centralized Stripe service: server/stripe.ts (lazy init, checkout, portal, plan catalog)
- GET /api/billing/plans returns plan catalog from STRIPE_PRICE_PRO/STRIPE_PRICE_ENTERPRISE env vars (fallback to static plans when Stripe not configured)
- POST /api/billing/checkout creates Stripe Checkout session for plan upgrades
- POST /api/billing/portal creates Stripe Customer Portal session
- GET /api/billing/summary returns plan, status, trial info, usage counts, invoices
- stripeCustomerId column on companies table for Stripe customer persistence
- No hardcoded prices in frontend - plans fetched from API, prices shown in Stripe Checkout
- Env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_PRO, STRIPE_PRICE_ENTERPRISE, APP_URL (optional)

**Billing Center UI:**
- /billing page with Current Plan, Usage, Upgrade Plan (dynamic from API), Invoices, and Manage Billing
- Mock auth gracefully handled: billing page shows demo data when using mock login
- Full i18n support (EN + ES-MX)
- Navigation: Billing nav item added to sidebar between Compliance and Settings

**Account Creation & Onboarding:**
- Create Account page at /create-account with 14-day free trial (no credit card)
- 3-step onboarding wizard at /onboarding (add employees, upload docs, confirmation)
- Trial banner on dashboard showing countdown
- Backend: POST /api/auth/create-account with trial logic

## Previous Updates (November 2024)

**Landing Page Messaging Improvements:**
- Updated hero: "AI-powered OSHA compliance you can trust" with emphasis on inspection-ready documentation
- Moved training table preview from hero to dedicated "How It Works" section after features
- Updated features section: "Document learning and understanding" emphasizing evidence of compliance
- Repositioned "For Safety" section: "Built for safety managers who lead compliance" 
- Enhanced AI transparency messaging: AI assists with documentation, doesn't replace expertise
- Removed "For Training Providers" section to maintain focus on primary audience
- Added professional 3-column dark-theme footer (Company info, Product, Company links)
- Created SupportWidget.tsx placeholder component for future chatbot integration (not currently rendered)

**Authentication Improvements:**
- Login now accepts both email and username
- Sign-up modal with username (optional), email (required), password, and company name
- All CTAs changed from "Book a demo" / "Contact sales" to "Create an account"

**Messaging Guidelines:**
- Focus on compliance clarity and trust, not "avoiding fines"
- Emphasize documenting learning outcomes and understanding, not just training completion
- Safety managers own compliance; HR collaborates and supports
- No references to "attendance tracking"
- AI is transparent and enhances expertise rather than replacing it

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Structure (Multi-App)

The frontend is split into two separate apps for independent deployment:
- **`client/`** - Original client folder (still used by main `npm run dev` workflow via root `vite.config.ts`)
- **`apps/workspace-web/`** - Customer-facing workspace app (copy of client, has own `vite.config.ts` and `tsconfig.json`)
- **`apps/admin-console/`** - Admin console app (copy of workspace-web, has own `vite.config.ts` and `tsconfig.json`)

**Running the apps:**
- `npm run dev` or `npm run dev:workspace` - Runs workspace via Express server on port 5000
- `npm run dev:admin` - Runs admin console standalone Vite dev server on port 5174 (proxies API to port 5000)

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
- `/` - Landing page with hero, features, "How It Works" section, pricing, and professional footer
- `/login` - Authentication page with glassmorphic card design and sign-up modal
- `/dashboard` - Training records overview with compliance metrics
- `/employees` - Employee management with location assignments
- `/not-found` - 404 error page

**Key Components**
- `SupportWidget.tsx` - Placeholder component for future chatbot/support feature (not currently rendered)

### Backend Architecture

**Server Framework**
- **Express.js** as the HTTP server
- **TypeScript** with ES modules
- Custom middleware for request logging and JSON parsing

**Authentication & Authorization**
- **JWT (JSON Web Tokens)** for stateless authentication with role claims
- JWT payload: `{ userId, email, role, orgId }`
- Roles: `workspace_user`, `owner_admin`, `csr_admin`
- **bcryptjs** for password hashing
- Bearer token authentication via Authorization headers
- Session management with 7-day token expiration
- `requireAuth` middleware: verifies JWT, attaches `req.user`
- `requireRole(roles[])` middleware: checks user role against allowed list
- Login supports both email and username lookup
- Registration requires email (unique), optional username, password, and company name

**Security Middleware**
- **helmet** for HTTP security headers (CSP disabled for dev compatibility)
- **cors** with origin allowlist from `CORS_ORIGINS` env var (auto-allows `*.replit.dev` in dev)
- **Rate limiting** on auth endpoints (10 req / 15 min per IP) and admin routes (120 req / 5 min per IP)
- Request body size limit: 2MB
- Safe error messages (no stack traces or internal details leaked)

**API Design**
- RESTful API endpoints under `/api` prefix
- Auth routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/whoami`
- Workspace routes: `/api/employees`, `/api/locations`, `/api/training-records`
- Admin routes (role-protected): `/api/admin/overview`, `/api/admin/tickets`, `/api/admin/audit`
- Query parameters for filtering (e.g., expiring records by days)
- Consistent error handling with JSON responses

**Business Logic Layer**
- Storage abstraction through `IStorage` interface
- `DbStorage` implementation for database operations
- Separation of concerns between routes, storage, and auth layers
- Admin audit logging via `server/audit.ts` → `admin_audit_logs` table

### Data Storage

**Database**
- **PostgreSQL** via Neon serverless
- **Drizzle ORM** for type-safe database queries
- WebSocket-based connection pooling via `@neondatabase/serverless`

**Schema Design**
- `users` - Authentication and user profiles (includes `role` column)
- `companies` - Company/organization records
- `locations` - Work sites/facilities per company
- `employees` - Worker records with location assignments
- `training_records` - OSHA training completion tracking
- `admin_audit_logs` - Audit trail for admin actions

**Key Relationships**
- Users belong to companies (multi-organization architecture)
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