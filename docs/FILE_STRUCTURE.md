# WG Life OS - Complete File & Folder Structure

**Project Owner:** Waseem Ghaly  
**Framework:** Next.js 14+ (App Router)  
**Date:** January 29, 2026

---

## COMPLETE PROJECT STRUCTURE

```
wg-life-os/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                          # CI/CD pipeline
│   │   ├── deploy.yml                      # Deployment workflow
│   │   └── security-scan.yml               # Security scanning
│   └── dependabot.yml                      # Dependency updates
│
├── public/
│   ├── assets/
│   │   ├── icons/
│   │   │   ├── icon-192x192.png           # PWA icon
│   │   │   ├── icon-512x512.png           # PWA icon
│   │   │   ├── apple-touch-icon.png       # iOS icon
│   │   │   └── favicon.ico                # Favicon
│   │   ├── images/
│   │   │   ├── logo.svg                   # WG Life OS logo
│   │   │   ├── logo-light.svg             # Light variant (if needed)
│   │   │   └── profile-placeholder.png    # Default profile image
│   │   └── fonts/                         # Self-hosted fonts (if any)
│   │       ├── serif-regular.woff2
│   │       └── sans-regular.woff2
│   ├── manifest.json                       # PWA manifest
│   ├── robots.txt                          # SEO robots file
│   └── sw.js                               # Service Worker (generated)
│
├── src/
│   │
│   ├── app/                                # Next.js App Router
│   │   ├── (auth)/                         # Auth route group (different layout)
│   │   │   ├── layout.tsx                  # Auth layout (minimal, centered)
│   │   │   ├── login/
│   │   │   │   ├── page.tsx                # Login page
│   │   │   │   └── actions.ts              # Login server actions
│   │   │   ├── register/
│   │   │   │   ├── page.tsx                # Registration page
│   │   │   │   └── actions.ts              # Registration server actions
│   │   │   ├── verify-email/
│   │   │   │   └── page.tsx                # Email verification handler
│   │   │   ├── setup-biometric/
│   │   │   │   ├── page.tsx                # WebAuthn setup page
│   │   │   │   └── actions.ts              # WebAuthn server actions
│   │   │   └── forgot-password/
│   │   │       ├── page.tsx                # Password reset request
│   │   │       └── actions.ts              # Password reset actions
│   │   │
│   │   ├── (dashboard)/                    # Main app route group (with sidebar)
│   │   │   ├── layout.tsx                  # Dashboard layout (sidebar + header)
│   │   │   ├── page.tsx                    # Home / Today view
│   │   │   │
│   │   │   ├── onboarding/                 # First-time user setup
│   │   │   │   ├── page.tsx                # Onboarding orchestrator
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx            # Step 1: Profile setup
│   │   │   │   ├── identity/
│   │   │   │   │   └── page.tsx            # Step 2: Identity statements
│   │   │   │   ├── values/
│   │   │   │   │   └── page.tsx            # Step 3: Core values
│   │   │   │   └── complete/
│   │   │   │       └── page.tsx            # Onboarding complete
│   │   │   │
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx                # Profile overview
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx            # Edit profile
│   │   │   │   └── life-seasons/
│   │   │   │       ├── page.tsx            # Life seasons list
│   │   │   │       ├── [id]/
│   │   │   │       │   └── page.tsx        # Season detail
│   │   │   │       └── new/
│   │   │   │           └── page.tsx        # Create new season
│   │   │   │
│   │   │   ├── identity/
│   │   │   │   ├── page.tsx                # Identity dashboard
│   │   │   │   ├── manifesto/
│   │   │   │   │   ├── page.tsx            # Edit manifesto
│   │   │   │   │   └── history/
│   │   │   │   │       └── page.tsx        # Version history
│   │   │   │   ├── values/
│   │   │   │   │   ├── page.tsx            # Core values list
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx        # Edit value
│   │   │   │   └── faith/
│   │   │   │       ├── page.tsx            # Faith reflections list
│   │   │   │       ├── [id]/
│   │   │   │       │   └── page.tsx        # View/edit reflection
│   │   │   │       └── new/
│   │   │   │           └── page.tsx        # New reflection
│   │   │   │
│   │   │   ├── goals/
│   │   │   │   ├── page.tsx                # Goals dashboard
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx            # Goal detail
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx        # Edit goal
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx            # Create new goal
│   │   │   │   └── archived/
│   │   │   │       └── page.tsx            # Archived goals
│   │   │   │
│   │   │   ├── routines/
│   │   │   │   ├── page.tsx                # Routines overview
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx            # Routine detail + logs
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx        # Edit routine
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx            # Create routine
│   │   │   │   └── logs/
│   │   │   │       └── page.tsx            # All routine logs (calendar view)
│   │   │   │
│   │   │   ├── habits/
│   │   │   │   ├── page.tsx                # Habits dashboard
│   │   │   │   ├── good/
│   │   │   │   │   ├── page.tsx            # Good habits list
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx        # Habit detail + logs
│   │   │   │   │   │   └── edit/
│   │   │   │   │   │       └── page.tsx    # Edit habit
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx        # Create good habit
│   │   │   │   ├── bad/
│   │   │   │   │   ├── page.tsx            # Bad habits list
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx        # Bad habit detail + analysis
│   │   │   │   │   │   └── edit/
│   │   │   │   │   │       └── page.tsx    # Edit bad habit
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx        # Create bad habit
│   │   │   │   └── logs/
│   │   │   │       └── page.tsx            # All habit logs
│   │   │   │
│   │   │   ├── people/
│   │   │   │   ├── page.tsx                # People dashboard (circles view)
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx            # Person detail
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   └── page.tsx        # Edit person
│   │   │   │   │   └── notes/
│   │   │   │   │       ├── page.tsx        # Notes list
│   │   │   │   │       └── [noteId]/
│   │   │   │   │           └── page.tsx    # Note detail
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx            # Add new person
│   │   │   │   └── exes/
│   │   │   │       ├── page.tsx            # Exes list
│   │   │   │       └── [id]/
│   │   │   │           ├── page.tsx        # Ex detail + reflection
│   │   │   │           └── edit/
│   │   │   │               └── page.tsx    # Edit ex reflection
│   │   │   │
│   │   │   ├── prayer/
│   │   │   │   ├── page.tsx                # Prayer dashboard
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx            # Prayer detail + logs
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx        # Edit prayer
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx            # New prayer request
│   │   │   │   └── answered/
│   │   │   │       └── page.tsx            # Answered prayers
│   │   │   │
│   │   │   ├── finance/
│   │   │   │   ├── page.tsx                # Finance dashboard
│   │   │   │   ├── overview/
│   │   │   │   │   └── page.tsx            # Net worth + cash flow
│   │   │   │   ├── cash-flow/
│   │   │   │   │   ├── page.tsx            # Cash flow entries
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx        # Edit entry
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx        # New entry
│   │   │   │   └── investments/
│   │   │   │       ├── page.tsx            # Investments list
│   │   │   │       ├── [id]/
│   │   │   │       │   ├── page.tsx        # Investment detail
│   │   │   │       │   └── edit/
│   │   │   │       │       └── page.tsx    # Edit investment
│   │   │   │       └── new/
│   │   │   │           └── page.tsx        # New investment
│   │   │   │
│   │   │   ├── business/
│   │   │   │   ├── page.tsx                # Business dashboard
│   │   │   │   ├── companies/
│   │   │   │   │   ├── page.tsx            # Companies list
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx        # Company detail
│   │   │   │   │   │   ├── edit/
│   │   │   │   │   │   │   └── page.tsx    # Edit company
│   │   │   │   │   │   ├── products/
│   │   │   │   │   │   │   ├── page.tsx    # Products list
│   │   │   │   │   │   │   ├── [productId]/
│   │   │   │   │   │   │   │   └── page.tsx # Product detail
│   │   │   │   │   │   │   └── new/
│   │   │   │   │   │   │       └── page.tsx # New product
│   │   │   │   │   │   └── cap-table/
│   │   │   │   │   │       └── page.tsx    # Cap table view
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx        # New company
│   │   │   │   └── equity-summary/
│   │   │   │       └── page.tsx            # Total equity overview
│   │   │   │
│   │   │   ├── insights/
│   │   │   │   ├── page.tsx                # Insights dashboard
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx            # Insight detail
│   │   │   │   └── behavioral/
│   │   │   │       └── page.tsx            # Behavioral insights
│   │   │   │
│   │   │   ├── accountability/
│   │   │   │   ├── page.tsx                # Accountability dashboard
│   │   │   │   ├── invite/
│   │   │   │   │   └── page.tsx            # Invite Point of Light
│   │   │   │   ├── links/
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx        # Link detail (manage scopes)
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx    # Edit permissions
│   │   │   │   └── viewing/
│   │   │   │       └── [userId]/
│   │   │   │           └── page.tsx        # View someone else's Life OS (as PoL)
│   │   │   │
│   │   │   └── settings/
│   │   │       ├── page.tsx                # Settings dashboard
│   │   │       ├── profile/
│   │   │       │   └── page.tsx            # Profile settings
│   │   │       ├── security/
│   │   │       │   └── page.tsx            # Security settings (password, biometric)
│   │   │       ├── notifications/
│   │   │       │   └── page.tsx            # Notification preferences
│   │   │       ├── data/
│   │   │       │   └── page.tsx            # Data export/delete
│   │   │       └── account/
│   │   │           └── page.tsx            # Account management
│   │   │
│   │   ├── api/                            # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts            # NextAuth handler
│   │   │   ├── webauthn/
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts            # WebAuthn registration
│   │   │   │   └── authenticate/
│   │   │   │       └── route.ts            # WebAuthn authentication
│   │   │   ├── push/
│   │   │   │   ├── subscribe/
│   │   │   │   │   └── route.ts            # Push subscription
│   │   │   │   ├── unsubscribe/
│   │   │   │   │   └── route.ts            # Push unsubscription
│   │   │   │   └── send/
│   │   │   │       └── route.ts            # Send push notification
│   │   │   ├── cron/
│   │   │   │   ├── insights/
│   │   │   │   │   └── route.ts            # Insights generation cron
│   │   │   │   ├── notifications/
│   │   │   │   │   └── route.ts            # Notification dispatch cron
│   │   │   │   └── birthday-check/
│   │   │   │       └── route.ts            # Birthday notification cron
│   │   │   ├── health/
│   │   │   │   └── route.ts                # Health check endpoint
│   │   │   └── export/
│   │   │       └── route.ts                # Data export endpoint
│   │   │
│   │   ├── actions/                        # Server Actions (organized by domain)
│   │   │   ├── auth.ts                     # Auth actions (login, logout, etc.)
│   │   │   ├── profile.ts                  # Profile CRUD
│   │   │   ├── identity.ts                 # Identity statements CRUD
│   │   │   ├── values.ts                   # Core values CRUD
│   │   │   ├── faith.ts                    # Faith reflections CRUD
│   │   │   ├── life-seasons.ts             # Life seasons CRUD
│   │   │   ├── goals.ts                    # Goals CRUD
│   │   │   ├── routines.ts                 # Routines CRUD
│   │   │   ├── routine-logs.ts             # Routine logging
│   │   │   ├── habits.ts                   # Habits CRUD
│   │   │   ├── habit-logs.ts               # Habit logging
│   │   │   ├── people.ts                   # People CRUD
│   │   │   ├── relationship-notes.ts       # Relationship notes CRUD
│   │   │   ├── exes.ts                     # Ex relationships CRUD
│   │   │   ├── prayer.ts                   # Prayer entries CRUD
│   │   │   ├── prayer-logs.ts              # Prayer logging
│   │   │   ├── finance.ts                  # Finance overview
│   │   │   ├── cash-flow.ts                # Cash flow entries CRUD
│   │   │   ├── investments.ts              # Investments CRUD
│   │   │   ├── companies.ts                # Companies CRUD
│   │   │   ├── company-products.ts         # Products CRUD
│   │   │   ├── cap-table.ts                # Cap table CRUD
│   │   │   ├── accountability.ts           # Accountability links CRUD
│   │   │   ├── accountability-comments.ts  # Comments CRUD
│   │   │   ├── insights.ts                 # Insights actions
│   │   │   └── notifications.ts            # Notification actions
│   │   │
│   │   ├── layout.tsx                      # Root layout
│   │   ├── loading.tsx                     # Root loading state
│   │   ├── error.tsx                       # Root error boundary
│   │   ├── not-found.tsx                   # 404 page
│   │   └── global-error.tsx                # Global error handler
│   │
│   ├── components/                         # React Components
│   │   ├── ui/                             # Base UI components
│   │   │   ├── button.tsx                  # Button component
│   │   │   ├── input.tsx                   # Input component
│   │   │   ├── textarea.tsx                # Textarea component
│   │   │   ├── select.tsx                  # Select component
│   │   │   ├── checkbox.tsx                # Checkbox component
│   │   │   ├── radio.tsx                   # Radio button
│   │   │   ├── switch.tsx                  # Toggle switch
│   │   │   ├── slider.tsx                  # Slider component
│   │   │   ├── card.tsx                    # Card container
│   │   │   ├── badge.tsx                   # Badge component
│   │   │   ├── dialog.tsx                  # Modal dialog
│   │   │   ├── dropdown.tsx                # Dropdown menu
│   │   │   ├── tabs.tsx                    # Tabs component
│   │   │   ├── toast.tsx                   # Toast notification
│   │   │   ├── tooltip.tsx                 # Tooltip
│   │   │   ├── progress.tsx                # Progress bar
│   │   │   ├── spinner.tsx                 # Loading spinner
│   │   │   ├── separator.tsx               # Divider line
│   │   │   └── skeleton.tsx                # Loading skeleton
│   │   │
│   │   ├── layout/                         # Layout components
│   │   │   ├── sidebar.tsx                 # Main sidebar navigation
│   │   │   ├── header.tsx                  # Header with user menu
│   │   │   ├── mobile-nav.tsx              # Mobile navigation
│   │   │   └── page-header.tsx             # Page title + breadcrumbs
│   │   │
│   │   ├── auth/                           # Auth-specific components
│   │   │   ├── login-form.tsx              # Login form
│   │   │   ├── register-form.tsx           # Registration form
│   │   │   ├── biometric-setup.tsx         # WebAuthn setup UI
│   │   │   ├── biometric-prompt.tsx        # Biometric challenge UI
│   │   │   └── auto-lock-screen.tsx        # Auto-lock overlay
│   │   │
│   │   ├── profile/                        # Profile components
│   │   │   ├── profile-header.tsx          # Profile overview header
│   │   │   ├── profile-form.tsx            # Edit profile form
│   │   │   ├── life-season-card.tsx        # Life season display
│   │   │   └── age-timeline.tsx            # Visual age timeline
│   │   │
│   │   ├── identity/                       # Identity components
│   │   │   ├── manifesto-editor.tsx        # Rich text editor for manifesto
│   │   │   ├── value-card.tsx              # Core value card
│   │   │   ├── value-form.tsx              # Core value form
│   │   │   └── faith-reflection-form.tsx   # Faith reflection form
│   │   │
│   │   ├── goals/                          # Goals components
│   │   │   ├── goal-card.tsx               # Goal display card
│   │   │   ├── goal-form.tsx               # Create/edit goal form
│   │   │   ├── goal-progress-bar.tsx       # Visual progress
│   │   │   ├── goal-list.tsx               # List of goals
│   │   │   └── goal-filters.tsx            # Filter goals by category/status
│   │   │
│   │   ├── routines/                       # Routine components
│   │   │   ├── routine-card.tsx            # Routine display
│   │   │   ├── routine-form.tsx            # Create/edit routine
│   │   │   ├── routine-log-button.tsx      # One-tap complete button
│   │   │   ├── routine-checklist.tsx       # Routine items checklist
│   │   │   ├── routine-calendar.tsx        # Calendar view of logs
│   │   │   └── routine-streak.tsx          # Streak counter
│   │   │
│   │   ├── habits/                         # Habit components
│   │   │   ├── habit-card.tsx              # Habit display card
│   │   │   ├── habit-form.tsx              # Create/edit habit
│   │   │   ├── habit-log-form.tsx          # Log habit completion
│   │   │   ├── habit-chart.tsx             # Habit trend chart
│   │   │   ├── bad-habit-trigger-form.tsx  # Bad habit analysis
│   │   │   └── habit-streak-display.tsx    # Streak visualization
│   │   │
│   │   ├── people/                         # People/Relationships components
│   │   │   ├── person-card.tsx             # Person display card
│   │   │   ├── person-form.tsx             # Add/edit person
│   │   │   ├── relationship-circles.tsx    # Concentric circles visualization
│   │   │   ├── relationship-note-form.tsx  # Add note form
│   │   │   ├── relationship-note-card.tsx  # Note display
│   │   │   ├── ex-reflection-form.tsx      # Ex relationship reflection
│   │   │   └── person-timeline.tsx         # Interaction timeline
│   │   │
│   │   ├── prayer/                         # Prayer components
│   │   │   ├── prayer-card.tsx             # Prayer request card
│   │   │   ├── prayer-form.tsx             # Create/edit prayer
│   │   │   ├── prayer-log-button.tsx       # Log prayer button
│   │   │   ├── prayer-list.tsx             # Prayer list
│   │   │   └── answered-prayer-card.tsx    # Answered prayer display
│   │   │
│   │   ├── finance/                        # Finance components
│   │   │   ├── net-worth-display.tsx       # Net worth summary
│   │   │   ├── cash-flow-chart.tsx         # Income/expense chart
│   │   │   ├── cash-flow-entry-form.tsx    # Add entry form
│   │   │   ├── investment-card.tsx         # Investment display
│   │   │   ├── investment-form.tsx         # Add/edit investment
│   │   │   └── finance-stats.tsx           # Financial statistics
│   │   │
│   │   ├── business/                       # Business components
│   │   │   ├── company-card.tsx            # Company display card
│   │   │   ├── company-form.tsx            # Add/edit company
│   │   │   ├── equity-breakdown.tsx        # Ownership visualization
│   │   │   ├── cap-table-view.tsx          # Cap table display
│   │   │   ├── product-card.tsx            # Product card
│   │   │   ├── product-form.tsx            # Add/edit product
│   │   │   └── valuation-history.tsx       # Valuation timeline
│   │   │
│   │   ├── insights/                       # Insights components
│   │   │   ├── insight-card.tsx            # Insight display
│   │   │   ├── insight-detail.tsx          # Insight full view
│   │   │   ├── insight-filters.tsx         # Filter by category/severity
│   │   │   ├── behavioral-chart.tsx        # Behavioral trend chart
│   │   │   └── insight-action-button.tsx   # Take action button
│   │   │
│   │   ├── accountability/                 # Accountability components
│   │   │   ├── invite-form.tsx             # Invite Point of Light
│   │   │   ├── accountability-link-card.tsx # Link display
│   │   │   ├── scope-selector.tsx          # Scope permission UI
│   │   │   ├── comment-form.tsx            # Add comment
│   │   │   ├── comment-card.tsx            # Comment display
│   │   │   └── pol-dashboard.tsx           # Point of Light view
│   │   │
│   │   ├── dashboard/                      # Dashboard-specific components
│   │   │   ├── today-view.tsx              # Today's routines + habits
│   │   │   ├── stats-card.tsx              # Stat display card
│   │   │   ├── quick-actions.tsx           # Quick action buttons
│   │   │   └── recent-activity.tsx         # Recent logs feed
│   │   │
│   │   └── shared/                         # Shared utility components
│   │       ├── date-picker.tsx             # Date picker
│   │       ├── time-picker.tsx             # Time picker
│   │       ├── rich-text-editor.tsx        # Rich text editor
│   │       ├── chart-wrapper.tsx           # Chart container
│   │       ├── empty-state.tsx             # Empty state UI
│   │       ├── error-display.tsx           # Error message UI
│   │       ├── confirmation-dialog.tsx     # Confirm action dialog
│   │       └── form-field.tsx              # Form field wrapper
│   │
│   ├── lib/                                # Shared utilities & logic
│   │   ├── auth.ts                         # Auth utilities (session, etc.)
│   │   ├── db.ts                           # Database client setup
│   │   ├── utils.ts                        # General utilities
│   │   ├── validators.ts                   # Zod schemas for validation
│   │   ├── constants.ts                    # App constants
│   │   ├── date-utils.ts                   # Date manipulation utilities
│   │   ├── encryption.ts                   # Encryption utilities
│   │   ├── webauthn.ts                     # WebAuthn helpers
│   │   ├── push-notifications.ts           # Push notification helpers
│   │   └── errors.ts                       # Custom error classes
│   │
│   ├── db/                                 # Database layer
│   │   ├── schema.ts                       # Drizzle schema definitions
│   │   ├── migrations/                     # Database migrations
│   │   │   └── 0001_initial.sql            # Initial migration
│   │   ├── seed.ts                         # Seed data script
│   │   └── queries/                        # Reusable queries
│   │       ├── users.ts                    # User queries
│   │       ├── goals.ts                    # Goal queries
│   │       ├── habits.ts                   # Habit queries
│   │       ├── routines.ts                 # Routine queries
│   │       ├── people.ts                   # People queries
│   │       ├── finance.ts                  # Finance queries
│   │       ├── business.ts                 # Business queries
│   │       ├── insights.ts                 # Insights queries
│   │       └── dashboard.ts                # Dashboard aggregations
│   │
│   ├── edge/                               # Edge Functions
│   │   ├── insights/
│   │   │   ├── detect.ts                   # Main insights detection
│   │   │   ├── behavioral.ts               # Behavioral pattern detection
│   │   │   ├── financial.ts                # Financial pattern detection
│   │   │   ├── relationship.ts             # Relationship pattern detection
│   │   │   └── faith.ts                    # Faith pattern detection
│   │   ├── alerts/
│   │   │   ├── dispatch.ts                 # Alert dispatcher
│   │   │   └── filter.ts                   # Alert filtering logic
│   │   └── sync/
│   │       └── handler.ts                  # Background sync handler
│   │
│   ├── services/                           # Business logic services
│   │   ├── auth-service.ts                 # Authentication service
│   │   ├── profile-service.ts              # Profile business logic
│   │   ├── goal-service.ts                 # Goal business logic
│   │   ├── routine-service.ts              # Routine business logic
│   │   ├── habit-service.ts                # Habit business logic
│   │   ├── insight-service.ts              # Insight generation logic
│   │   ├── notification-service.ts         # Notification logic
│   │   └── accountability-service.ts       # Accountability logic
│   │
│   ├── hooks/                              # Custom React hooks
│   │   ├── use-auth.ts                     # Auth hook
│   │   ├── use-biometric.ts                # Biometric hook
│   │   ├── use-auto-lock.ts                # Auto-lock hook
│   │   ├── use-offline.ts                  # Offline detection hook
│   │   ├── use-push.ts                     # Push notification hook
│   │   ├── use-form.ts                     # Form state hook
│   │   ├── use-toast.ts                    # Toast notification hook
│   │   └── use-debounce.ts                 # Debounce hook
│   │
│   ├── types/                              # TypeScript type definitions
│   │   ├── index.ts                        # Exported types
│   │   ├── database.ts                     # Database types (from Drizzle)
│   │   ├── api.ts                          # API types
│   │   ├── auth.ts                         # Auth types
│   │   ├── goals.ts                        # Goal types
│   │   ├── habits.ts                       # Habit types
│   │   ├── routines.ts                     # Routine types
│   │   ├── people.ts                       # People types
│   │   ├── finance.ts                      # Finance types
│   │   ├── business.ts                     # Business types
│   │   ├── insights.ts                     # Insight types
│   │   └── notifications.ts                # Notification types
│   │
│   ├── styles/                             # Global styles
│   │   ├── globals.css                     # Global CSS + Tailwind imports
│   │   └── theme.css                       # CSS variables for theme
│   │
│   └── middleware.ts                       # Next.js middleware (auth, etc.)
│
├── tests/                                  # Test files
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       └── flows/
│
├── scripts/                                # Utility scripts
│   ├── generate-vapid-keys.js             # Generate VAPID keys
│   ├── seed-database.ts                    # Seed database script
│   └── backup-database.sh                  # Backup script
│
├── docs/                                   # Documentation
│   ├── SYSTEM_ARCHITECTURE.md              # (This file)
│   ├── DATABASE_SCHEMA.sql                 # (Generated)
│   ├── API_DOCUMENTATION.md                # API docs
│   ├── DEPLOYMENT.md                       # Deployment guide
│   └── CONTRIBUTING.md                     # Contribution guide
│
├── .env.local                              # Local environment variables (not committed)
├── .env.example                            # Example environment variables
├── .gitignore                              # Git ignore file
├── .eslintrc.json                          # ESLint configuration
├── .prettierrc                             # Prettier configuration
├── tsconfig.json                           # TypeScript configuration
├── next.config.js                          # Next.js configuration
├── tailwind.config.ts                      # Tailwind configuration
├── postcss.config.js                       # PostCSS configuration
├── drizzle.config.ts                       # Drizzle ORM configuration
├── package.json                            # Dependencies
├── pnpm-lock.yaml                          # Lock file
└── README.md                               # Project README
```

---

## FILE RESPONSIBILITIES BREAKDOWN

### `/src/app/` - Next.js App Router

**Purpose:** Routing, page rendering, layouts

**Key Files:**
- **layout.tsx (root):** Root HTML, metadata, font loading, providers
- **(auth)/layout.tsx:** Minimal auth layout (centered, no sidebar)
- **(dashboard)/layout.tsx:** Main app layout (sidebar, header, auto-lock logic)
- **page.tsx (dashboard):** Today view (routines + habits for today)
- **middleware.ts:** Auth middleware, biometric check, auto-lock enforcement

---

### `/src/app/actions/` - Server Actions

**Purpose:** Backend data mutations with type safety

**Pattern:**
```typescript
'use server'

export async function createGoal(data: CreateGoalInput): Promise<Result<Goal>> {
  const session = await auth()
  if (!session) throw new AuthError()
  
  const validated = createGoalSchema.parse(data)
  const goal = await db.transaction(async (tx) => {
    // Insert logic
    return await tx.insert(goals).values(validated).returning()
  })
  
  revalidatePath('/goals')
  return { success: true, data: goal }
}
```

**Files:** One file per domain (goals.ts, habits.ts, etc.)

---

### `/src/app/api/` - API Routes

**Purpose:** External webhooks, cron jobs, push endpoints

**Key Endpoints:**
- **/api/auth/[...nextauth]/route.ts:** NextAuth configuration
- **/api/webauthn/register/route.ts:** WebAuthn credential registration
- **/api/push/subscribe/route.ts:** Store push subscription
- **/api/cron/insights/route.ts:** Scheduled insights generation
- **/api/health/route.ts:** Health check for monitoring

---

### `/src/components/` - React Components

**Organization:** By domain, with shared UI components

**Hierarchy:**
1. **ui/**: Primitive components (button, input, etc.)
2. **layout/**: Layout-specific (sidebar, header)
3. **domain/**: Feature-specific (goals/, habits/, etc.)
4. **shared/**: Reusable composites (date-picker, chart-wrapper)

**Naming Convention:**
- Use kebab-case for files: `goal-card.tsx`
- PascalCase for component names: `GoalCard`
- One component per file

---

### `/src/lib/` - Shared Utilities

**Purpose:** Utilities, constants, helpers that are used across the app

**Key Files:**
- **auth.ts:** `auth()` function, session utilities
- **db.ts:** Database client, connection pooling
- **validators.ts:** Zod schemas for all data types
- **webauthn.ts:** WebAuthn challenge generation, verification
- **push-notifications.ts:** VAPID, push sending logic

---

### `/src/db/` - Database Layer

**Purpose:** Database schema, migrations, queries

**Organization:**
- **schema.ts:** Drizzle ORM schema (mirrors SQL schema)
- **migrations/:** SQL migration files
- **queries/:** Reusable query functions

**Pattern:**
```typescript
// db/queries/goals.ts
export async function getGoalsByUser(userId: string) {
  return await db.query.goals.findMany({
    where: eq(goals.userId, userId),
    with: { linkedHabits: true },
  })
}
```

---

### `/src/edge/` - Edge Functions

**Purpose:** Low-latency, real-time processing

**Key Files:**
- **insights/detect.ts:** Main insights detection engine
- **alerts/dispatch.ts:** Alert/notification dispatcher
- **sync/handler.ts:** Background sync reconciliation

**Deployment:** Runs on Vercel Edge Runtime (globally distributed)

---

### `/src/services/` - Business Logic Services

**Purpose:** Complex business logic that doesn't fit in Server Actions

**Pattern:**
```typescript
// services/insight-service.ts
export class InsightService {
  async detectDisciplineDecay(userId: string): Promise<Insight[]> {
    // Complex analysis logic
  }
}
```

---

### `/src/hooks/` - Custom React Hooks

**Purpose:** Reusable stateful logic

**Key Hooks:**
- **use-auth.ts:** `useAuth()` - Access session, user data
- **use-biometric.ts:** `useBiometric()` - Trigger biometric prompt
- **use-auto-lock.ts:** `useAutoLock()` - Auto-lock behavior
- **use-offline.ts:** `useOffline()` - Detect online/offline state
- **use-push.ts:** `usePush()` - Subscribe to push notifications

---

### `/src/types/` - TypeScript Types

**Purpose:** Centralized type definitions

**Pattern:**
```typescript
// types/goals.ts
export type Goal = {
  id: string
  userId: string
  title: string
  category: GoalCategory
  status: GoalStatus
  // ...
}

export type CreateGoalInput = Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>
```

---

### Configuration Files

**next.config.js:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
  ],
})
```

**tailwind.config.ts:**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F0F0F',
        foreground: '#F5F5F5',
        secondary: '#B3B3B3',
        accent: '#B08968',
        border: '#2A2A2A',
      },
      fontFamily: {
        serif: ['var(--font-serif)'],
        sans: ['var(--font-sans)'],
      },
    },
  },
}

export default config
```

**drizzle.config.ts:**
```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config
```

---

## DEVELOPMENT WORKFLOW

### 1. Local Development
```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:push  # Push schema to local Postgres
pnpm db:seed  # Seed initial data

# Run dev server
pnpm dev

# Open http://localhost:3000
```

### 2. Database Changes
```bash
# 1. Edit src/db/schema.ts
# 2. Generate migration
pnpm db:generate

# 3. Apply migration
pnpm db:migrate

# 4. Verify
pnpm db:studio  # Open Drizzle Studio
```

### 3. Adding a New Feature
```
1. Create Server Action in src/app/actions/
2. Create API types in src/types/
3. Create UI component in src/components/
4. Create page in src/app/(dashboard)/
5. Update database schema if needed
6. Write tests in tests/
```

### 4. Testing
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### 5. Deployment
```bash
# Push to main branch
git push origin main

# Vercel auto-deploys
# Migrations run automatically
# Health checks verify deployment
```

---

## COPILOT IMPLEMENTATION NOTES

When implementing each file, follow these patterns:

### Server Actions
```typescript
'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// 1. Define input schema
const createGoalSchema = z.object({
  title: z.string().min(1).max(255),
  category: z.enum(['faith', 'character', 'health', 'finance', 'business', 'relationships']),
  // ...
})

// 2. Define action
export async function createGoal(data: z.infer<typeof createGoalSchema>) {
  // 3. Authenticate
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  
  // 4. Validate
  const validated = createGoalSchema.parse(data)
  
  // 5. Execute
  const goal = await db.insert(goals).values({
    ...validated,
    userId: session.user.id,
  }).returning()
  
  // 6. Revalidate
  revalidatePath('/goals')
  
  // 7. Return
  return { success: true, data: goal[0] }
}
```

### React Components
```typescript
'use client' // Only if interactive

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface GoalCardProps {
  goal: Goal
  onUpdate?: (goal: Goal) => void
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  // Component logic
  return (
    <div className="card">
      {/* JSX */}
    </div>
  )
}
```

### Pages (Server Components)
```typescript
import { auth } from '@/lib/auth'
import { getGoals } from '@/db/queries/goals'
import { GoalList } from '@/components/goals/goal-list'

export default async function GoalsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  
  const goals = await getGoals(session.user.id)
  
  return (
    <div>
      <h1>Goals</h1>
      <GoalList goals={goals} />
    </div>
  )
}
```

---

**END OF FILE STRUCTURE DOCUMENT**

Every file listed above MUST be created for complete implementation. No file is optional.
