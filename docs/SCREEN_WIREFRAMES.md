# WG Life OS - Complete Screen Wireframes

**Project Owner:** Waseem Ghaly  
**Total Screens:** 50+  
**Date:** January 29, 2026

---

## TABLE OF CONTENTS

1. [Authentication Screens](#1-authentication-screens)
2. [Onboarding Screens](#2-onboarding-screens)
3. [Dashboard](#3-dashboard)
4. [Profile Screens](#4-profile-screens)
5. [Identity Screens](#5-identity-screens)
6. [Goals Screens](#6-goals-screens)
7. [Routines Screens](#7-routines-screens)
8. [Habits Screens](#8-habits-screens)
9. [People & Relationships](#9-people--relationships)
10. [Prayer Screens](#10-prayer-screens)
11. [Finance Screens](#11-finance-screens)
12. [Business Screens](#12-business-screens)
13. [Insights Screens](#13-insights-screens)
14. [Accountability Screens](#14-accountability-screens)
15. [Settings Screens](#15-settings-screens)

---

## WIREFRAME NOTATION

**Components:**
- `[Button]` = Clickable button
- `{Input}` = Text input field
- `<Dropdown>` = Select dropdown
- `[ ] Checkbox` = Checkbox
- `( ) Radio` = Radio button
- `[=====]` = Progress bar
- `[📷]` = Image
- `≡` = Menu icon

**Layout:**
- `┌─────┐` = Container border
- `│ ... │` = Container content
- `─────────` = Separator line
- `⋮` = Scrollable area indicator

---

## 1. AUTHENTICATION SCREENS

### Screen 1.1: Landing Page (`/`)

```
┌─────────────────────────────────────────┐
│                                         │
│              [WG Life OS]               │
│         Personal Life Operating         │
│           System for Men                │
│                                         │
│            [Logo Image]                 │
│                                         │
│     "Build. Reflect. Grow."             │
│                                         │
│                                         │
│          [Get Started →]                │
│          [Sign In]                      │
│                                         │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- Logo (centered, 200x200px)
- Heading (H1, 32px)
- Subheading (16px, #B3B3B3)
- Primary Button (Get Started)
- Secondary Button (Sign In)

User Actions:
- Tap "Get Started" → Navigate to /register
- Tap "Sign In" → Navigate to /login

Data Displayed:
- None (static page)

Navigation:
- Get Started → /register
- Sign In → /login
```

---

### Screen 1.2: Register (`/register`)

```
┌─────────────────────────────────────────┐
│  [← Back]              WG Life OS       │
├─────────────────────────────────────────┤
│                                         │
│           Create Your Account           │
│                                         │
│  Email Address                          │
│  {email@example.com}                    │
│                                         │
│  Password                               │
│  {••••••••}                             │
│  [👁] Show                              │
│  ℹ Min 8 characters                     │
│                                         │
│  Confirm Password                       │
│  {••••••••}                             │
│                                         │
│  [ ] I agree to Terms & Privacy Policy  │
│                                         │
│          [Create Account]               │
│                                         │
│  Already have an account? [Sign In]     │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- FormInput (email, password)
- PasswordToggle
- Checkbox
- PrimaryButton
- Link

User Actions:
- Enter email, password, confirm password
- Toggle password visibility
- Check terms agreement
- Tap "Create Account" → Call registerUser() → Navigate to /verify-email

Validation:
- Email: valid email format
- Password: min 8 chars
- Confirm: matches password
- Terms: must be checked

Error States:
- Email already exists → Show error below input
- Passwords don't match → Show error below confirm
- Terms not checked → Disable button

Navigation:
- Success → /verify-email
- Sign In link → /login
```

---

### Screen 1.3: Verify Email (`/verify-email`)

```
┌─────────────────────────────────────────┐
│              WG Life OS                 │
├─────────────────────────────────────────┤
│                                         │
│           Verify Your Email             │
│                                         │
│    We sent a verification link to:      │
│         waseem@example.com              │
│                                         │
│    Check your inbox and click the       │
│    link to continue.                    │
│                                         │
│       [Open Email App →]                │
│                                         │
│    Didn't receive it?                   │
│    [Resend Email]                       │
│                                         │
│    ───────────────────────              │
│                                         │
│    Already verified?                    │
│    [Continue to Setup Face ID]          │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- InfoCard
- PrimaryButton
- SecondaryButton
- TextLink

User Actions:
- Tap "Open Email App" → Opens default mail app
- Tap "Resend Email" → Calls resendVerificationEmail()
- Tap "Continue to Setup Face ID" → Navigate to /setup-biometric

Data Displayed:
- User's email address (from session)

Navigation:
- Email verified → /setup-biometric
```

---

### Screen 1.4: Setup Biometric (`/setup-biometric`)

```
┌─────────────────────────────────────────┐
│              WG Life OS                 │
├─────────────────────────────────────────┤
│                                         │
│         Setup Face ID / Touch ID        │
│                                         │
│         [Face ID Icon]                  │
│                                         │
│    Secure your account with biometric   │
│    authentication. You'll need this     │
│    every time you open the app.         │
│                                         │
│    ✓ Required for security              │
│    ✓ Fast and secure                    │
│    ✓ No passwords to remember           │
│                                         │
│                                         │
│       [Enable Face ID →]                │
│                                         │
│    [Skip for Now]                       │
│    (You can enable this later in        │
│     Settings)                           │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- Icon (Face ID)
- InfoList
- PrimaryButton
- TextButton

User Actions:
- Tap "Enable Face ID" → Trigger WebAuthn registration → Navigate to /onboarding/welcome
- Tap "Skip for Now" → Navigate to /onboarding/welcome (but biometricEnabled = false)

Technical:
- Call registerBiometric() from useWebAuthn hook
- Store credential in database
- Update user.biometricEnabled = true

Navigation:
- Success → /onboarding/welcome
- Skip → /onboarding/welcome (with warning)
```

---

### Screen 1.5: Login (`/login`)

```
┌─────────────────────────────────────────┐
│  [← Back]              WG Life OS       │
├─────────────────────────────────────────┤
│                                         │
│              Welcome Back               │
│                                         │
│  Email Address                          │
│  {email@example.com}                    │
│                                         │
│  Password                               │
│  {••••••••}                             │
│  [👁] Show                              │
│                                         │
│  [Forgot Password?]                     │
│                                         │
│          [Sign In →]                    │
│                                         │
│  Don't have an account? [Sign Up]       │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- FormInput (email, password)
- PasswordToggle
- TextLink
- PrimaryButton

User Actions:
- Enter email and password
- Tap "Sign In" → Call loginUser() → Navigate to /biometric-verify (if enabled) or /dashboard

Error States:
- Invalid credentials → Show error: "Invalid email or password"
- Account locked → Show error: "Account locked. Try again in X minutes."

Navigation:
- Success + biometric enabled → /biometric-verify
- Success + no biometric → /dashboard
- Forgot Password → /reset-password
```

---

### Screen 1.6: Biometric Verify (`/biometric-verify`)

```
┌─────────────────────────────────────────┐
│              WG Life OS                 │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         [Face ID Icon]                  │
│                                         │
│         Verify Your Identity            │
│                                         │
│    Use Face ID to access your account   │
│                                         │
│                                         │
│       [Verify with Face ID]             │
│                                         │
│                                         │
│    [Cancel]                             │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- Icon (Face ID, animated)
- Heading
- PrimaryButton
- TextButton

User Actions:
- Tap "Verify with Face ID" → Trigger WebAuthn authentication → Navigate to /dashboard
- Tap "Cancel" → Navigate back to /login

Technical:
- Call authenticateBiometric() from useWebAuthn
- Verify credential against stored public key
- Create session with biometricVerified = true

Navigation:
- Success → /dashboard
- Failure → Show error, allow retry
- Cancel → /login
```

---

### Screen 1.7: Auto-Lock Screen (`/auto-lock`)

```
┌─────────────────────────────────────────┐
│              WG Life OS                 │
├─────────────────────────────────────────┤
│                                         │
│           [Lock Icon]                   │
│                                         │
│         Session Locked                  │
│                                         │
│    Your session was locked due to       │
│    inactivity.                          │
│                                         │
│                                         │
│       [Unlock with Face ID]             │
│                                         │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- Icon (Lock)
- Heading
- Description Text
- PrimaryButton

User Actions:
- Tap "Unlock with Face ID" → Trigger biometric auth → Navigate back to previous route

Technical:
- Triggered by useAutoLock hook after 15 min inactivity
- Session still valid in database
- Just needs biometric re-verification

Navigation:
- Success → Return to previous route (stored in session)
```

---

## 2. ONBOARDING SCREENS

### Screen 2.1: Welcome (`/onboarding/welcome`)

```
┌─────────────────────────────────────────┐
│              WG Life OS                 │
├─────────────────────────────────────────┤
│                                         │
│         Welcome, [First Name]!          │
│                                         │
│    Let's set up your Life OS.           │
│    This will take about 5 minutes.      │
│                                         │
│                                         │
│    [Start Setup →]                      │
│                                         │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- Heading (personalized with firstName)
- Subheading
- PrimaryButton

User Actions:
- Tap "Start Setup" → Navigate to /onboarding/profile

Data Displayed:
- User's first name (if available in profile)

Navigation:
- Start → /onboarding/profile
```

---

### Screen 2.2: Profile Setup (`/onboarding/profile`)

```
┌─────────────────────────────────────────┐
│  [← Back]     Profile Setup    (1/5)    │
├─────────────────────────────────────────┤
│                                         │
│  [========              ] 20%           │
│                                         │
│  First Name                             │
│  {Waseem}                               │
│                                         │
│  Last Name                              │
│  {Ghaly}                                │
│                                         │
│  Date of Birth                          │
│  <MM/DD/YYYY>                           │
│                                         │
│  Timezone                               │
│  <America/New_York>                     │
│                                         │
│                                         │
│       [Continue →]                      │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- ProgressBar (20%)
- FormInput (text)
- DatePicker
- Dropdown (timezone)
- PrimaryButton

User Actions:
- Fill in personal details
- Select timezone
- Tap "Continue" → Call updateProfile() → Navigate to /onboarding/identity

Validation:
- First name: required
- Last name: required
- Date of birth: required, must be 18+
- Timezone: optional (default to browser timezone)

Navigation:
- Continue → /onboarding/identity
```

---

### Screen 2.3: Identity Setup (`/onboarding/identity`)

```
┌─────────────────────────────────────────┐
│  [← Back]   Identity Setup     (2/5)    │
├─────────────────────────────────────────┤
│  [=================     ] 40%           │
│                                         │
│  Who are you becoming?                  │
│                                         │
│  Personal Manifesto                     │
│  (What do you stand for?)               │
│  {Textarea - 5 lines}                   │
│                                         │
│  ─────────────────────────              │
│                                         │
│  The Man I Am Becoming                  │
│  (Your ideal self in 1 sentence)        │
│  {Textarea - 3 lines}                   │
│                                         │
│                                         │
│  [Skip for Now]    [Continue →]         │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- ProgressBar (40%)
- Heading
- Textarea (expandable)
- SecondaryButton (Skip)
- PrimaryButton (Continue)

User Actions:
- Fill identity statements (optional)
- Tap "Continue" → Call updateIdentityStatement() → Navigate to /onboarding/values
- Tap "Skip for Now" → Navigate to /onboarding/values

Data Saved:
- personalManifesto
- manIAmBecoming

Navigation:
- Continue/Skip → /onboarding/values
```

---

### Screen 2.4: Core Values (`/onboarding/values`)

```
┌─────────────────────────────────────────┐
│  [← Back]    Core Values       (3/5)    │
├─────────────────────────────────────────┤
│  [========================] 60%          │
│                                         │
│  What are your 3-5 core values?         │
│                                         │
│  Value 1                                │
│  {Integrity}                            │
│  [x] Remove                             │
│                                         │
│  Value 2                                │
│  {Growth}                               │
│  [x] Remove                             │
│                                         │
│  Value 3                                │
│  {Faith}                                │
│  [x] Remove                             │
│                                         │
│  [+ Add Value]                          │
│                                         │
│                                         │
│  [Skip for Now]    [Continue →]         │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- ProgressBar (60%)
- Heading
- FormInput (repeatable)
- RemoveButton
- AddButton
- SecondaryButton
- PrimaryButton

User Actions:
- Enter up to 5 core values
- Add/remove values
- Tap "Continue" → Call addCoreValue() for each → Navigate to /onboarding/goals

Validation:
- Each value: 1-100 characters
- Minimum: 0 (can skip)
- Maximum: 5 values

Navigation:
- Continue/Skip → /onboarding/goals
```

---

### Screen 2.5: First Goal (`/onboarding/goals`)

```
┌─────────────────────────────────────────┐
│  [← Back]   Set Your First Goal (4/5)   │
├─────────────────────────────────────────┤
│  [===============================] 80%   │
│                                         │
│  What's one goal you want to work on?   │
│                                         │
│  Goal Title                             │
│  {e.g., Read Bible daily}               │
│                                         │
│  Category                               │
│  <Faith>                                │
│  Options: Faith, Character, Health,     │
│           Finance, Business,            │
│           Relationships                 │
│                                         │
│  Time Horizon                           │
│  <Daily>                                │
│  Options: Daily, Weekly, Monthly,       │
│           Quarterly, Yearly, Lifetime   │
│                                         │
│  Why This Matters                       │
│  {Textarea - 3 lines}                   │
│                                         │
│  [Skip for Now]    [Create Goal →]      │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- ProgressBar (80%)
- FormInput
- Dropdown (category, timeHorizon)
- Textarea
- SecondaryButton
- PrimaryButton

User Actions:
- Enter goal details
- Tap "Create Goal" → Call createGoal() → Navigate to /onboarding/complete

Validation:
- Title: required, 1-255 chars
- Category: required
- Time horizon: required

Navigation:
- Continue/Skip → /onboarding/complete
```

---

### Screen 2.6: Setup Complete (`/onboarding/complete`)

```
┌─────────────────────────────────────────┐
│              WG Life OS                 │
├─────────────────────────────────────────┤
│  [====================================] │
│                                         │
│           [Checkmark Icon]              │
│                                         │
│         Setup Complete!                 │
│                                         │
│    Your Life OS is ready.               │
│    Let's start building.                │
│                                         │
│                                         │
│       [Go to Dashboard →]               │
│                                         │
│                                         │
└─────────────────────────────────────────┘

Components Used:
- ProgressBar (100%)
- Icon (Checkmark)
- Heading
- Subheading
- PrimaryButton

User Actions:
- Tap "Go to Dashboard" → Navigate to /dashboard

Navigation:
- Go to Dashboard → /dashboard
```

---

## 3. DASHBOARD

### Screen 3.1: Main Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]         WG Life OS    [👤]    │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  Good morning, Waseem                   │
│  Friday, January 29, 2026               │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Today's Focus                          │
│  ┌───────────────────────────────────┐ │
│  │ Morning Routine                   │ │
│  │ [====        ] 40% complete       │ │
│  │ [Continue →]                      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Active Goals (3)                       │
│  ┌───────────────────────────────────┐ │
│  │ 📖 Read Bible daily               │ │
│  │    [============    ] 75%         │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ 💪 Exercise 4x/week               │ │
│  │    [======          ] 50%         │ │
│  └───────────────────────────────────┘ │
│  [View All →]                           │
│                                         │
│  Insights (2 new)                       │
│  ┌───────────────────────────────────┐ │
│  │ 🚨 Discipline Decay Detected      │ │
│  │    Routine completion dropped     │ │
│  │    35% this week.                 │ │
│  │    [View Details →]               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Quick Actions                          │
│  [Log Habit] [Add Note] [View Prayer]  │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav (menu, logo, profile pic)
- Greeting (personalized, time-based)
- Card (TodaysFocusCard)
- GoalCard (with progress bar)
- InsightAlert
- QuickActionButtons

User Actions:
- Tap menu → Open sidebar
- Tap profile pic → Navigate to /profile
- Tap "Continue" on routine → Navigate to /routines/[id]
- Tap goal → Navigate to /goals/[id]
- Tap insight → Navigate to /insights/[id]
- Tap quick action buttons → Open respective modal/page

Data Displayed:
- Today's routines (scheduled for today)
- Active goals (status = in_progress, not archived)
- Recent insights (unacknowledged, past 7 days)

Navigation:
- Menu → /[various routes]
- Profile → /profile
- View All Goals → /goals
- View Insight → /insights/[id]
```

---

## 4. PROFILE SCREENS

### Screen 4.1: Profile (`/profile`)

```
┌─────────────────────────────────────────┐
│  [← Back]             Profile           │
├─────────────────────────────────────────┤
│  ⋮                                      │
│        [📷 Profile Photo]               │
│            (150x150px)                  │
│        [Change Photo]                   │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Waseem Ghaly                           │
│  waseem@example.com                     │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Personal Information                   │
│  ┌───────────────────────────────────┐ │
│  │ First Name:      Waseem           │ │
│  │ Last Name:       Ghaly            │ │
│  │ Date of Birth:   Jan 15, 1990     │ │
│  │ Timezone:        EST              │ │
│  │ [Edit]                            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Current Year Theme                     │
│  ┌───────────────────────────────────┐ │
│  │ "Year of Discipline & Growth"     │ │
│  │ [Edit]                            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Current Season                         │
│  ┌───────────────────────────────────┐ │
│  │ "Focusing on health and           │ │
│  │  spiritual foundation"            │ │
│  │ [Edit]                            │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- ProfilePhoto (with upload button)
- InfoSection (readonly)
- EditButton
- Card (editable fields)

User Actions:
- Tap "Change Photo" → Open file picker → Upload → Call uploadProfilePhoto()
- Tap "Edit" on any section → Open edit modal/form

Data Displayed:
- profile.firstName
- profile.lastName
- profile.dateOfBirth
- profile.timezone
- profile.currentYearTheme
- profile.currentSeasonDescription
- user.email

Navigation:
- Edit sections → Open modal, save → Refresh profile
```

---

### Screen 4.2: Edit Profile (`/profile/edit`)

```
┌─────────────────────────────────────────┐
│  [← Back]          Edit Profile         │
├─────────────────────────────────────────┤
│  ⋮                                      │
│                                         │
│  First Name                             │
│  {Waseem}                               │
│                                         │
│  Last Name                              │
│  {Ghaly}                                │
│                                         │
│  Date of Birth                          │
│  <01/15/1990>                           │
│                                         │
│  Timezone                               │
│  <America/New_York>                     │
│                                         │
│  Current Year Theme                     │
│  {Year of Discipline & Growth}          │
│                                         │
│  Current Season Description             │
│  {Focusing on health and spiritual...}  │
│  (Textarea - 5 lines)                   │
│                                         │
│                                         │
│  [Cancel]              [Save Changes]   │
│                                         │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- FormInput (all fields)
- DatePicker
- Dropdown (timezone)
- Textarea
- SecondaryButton (Cancel)
- PrimaryButton (Save)

User Actions:
- Edit any field
- Tap "Save Changes" → Call updateProfile() → Navigate back to /profile
- Tap "Cancel" → Navigate back without saving

Validation:
- First name: required
- Last name: required
- Date of birth: valid date, 18+

Navigation:
- Save → /profile (with success message)
- Cancel → /profile
```

---

## 5. IDENTITY SCREENS

### Screen 5.1: Identity Overview (`/identity`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]           Identity            │
├─────────────────────────────────────────┤
│  ⋮                                      │
│                                         │
│  "Know thyself" – Socrates              │
│                                         │
│  ─────────────────────────              │
│                                         │
│  [Personal Manifesto]                   │
│  [The Man I Am Becoming]                │
│  [My Calling]                           │
│                                         │
│  ─────────────────────────              │
│                                         │
│  [Core Values]                          │
│  [Faith Reflections]                    │
│  [Life Seasons]                         │
│                                         │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- Quote Block
- NavigationCard (tiles)

User Actions:
- Tap any card → Navigate to respective detail page

Navigation:
- Personal Manifesto → /identity/manifesto
- The Man I Am Becoming → /identity/becoming
- My Calling → /identity/calling
- Core Values → /identity/values
- Faith Reflections → /identity/faith
- Life Seasons → /identity/seasons
```

---

### Screen 5.2: Personal Manifesto (`/identity/manifesto`)

```
┌─────────────────────────────────────────┐
│  [← Back]       Personal Manifesto      │
├─────────────────────────────────────────┤
│  ⋮                                      │
│                                         │
│  What do you stand for?                 │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │  I stand for truth, integrity,    │ │
│  │  and unwavering commitment to     │ │
│  │  growth. I will not compromise    │ │
│  │  my values for temporary gains.   │ │
│  │  I am building a life of          │ │
│  │  significance, not just success.  │ │
│  │                                   │ │
│  │  (Full manifesto text...)         │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Last updated: January 15, 2026         │
│  Version: 3                             │
│                                         │
│  [View History]                         │
│  [Edit Manifesto]                       │
│                                         │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- Heading
- ReadonlyTextBlock
- Metadata (date, version)
- SecondaryButton (View History)
- PrimaryButton (Edit)

User Actions:
- Tap "Edit Manifesto" → Navigate to /identity/manifesto/edit
- Tap "View History" → Navigate to /identity/manifesto/history

Data Displayed:
- identityStatement.personalManifesto
- identityStatement.version
- identityStatement.updatedAt

Navigation:
- Edit → /identity/manifesto/edit
- View History → /identity/manifesto/history
```

---

### Screen 5.3: Core Values (`/identity/values`)

```
┌─────────────────────────────────────────┐
│  [← Back]          Core Values          │
├─────────────────────────────────────────┤
│  ⋮                                      │
│                                         │
│  Your 5 Core Values                     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 1. Integrity                      │ │
│  │    "Doing what's right even when  │ │
│  │     no one is watching"           │ │
│  │    [Edit] [Delete]                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 2. Growth                         │ │
│  │    "Becoming 1% better daily"     │ │
│  │    [Edit] [Delete]                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 3. Faith                          │ │
│  │    "Trusting God's plan"          │ │
│  │    [Edit] [Delete]                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  (... 2 more values ...)                │
│                                         │
│  [+ Add New Value]                      │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- Heading
- ValueCard (reorderable)
- IconButton (Edit, Delete)
- AddButton

User Actions:
- Tap "Edit" → Open modal to edit value
- Tap "Delete" → Confirm → Call deleteValue()
- Tap "+ Add New Value" → Navigate to /identity/values/add
- Drag to reorder → Call updateValueOrder()

Data Displayed:
- coreValues[] (ordered by displayOrder)
  - valueName
  - definition
  - whyItMatters

Navigation:
- Add New → /identity/values/add
- Edit → Open edit modal
```

---

### Screen 5.4: Faith Reflections (`/identity/faith`)

```
┌─────────────────────────────────────────┐
│  [← Back]       Faith Reflections       │
├─────────────────────────────────────────┤
│  ⋮                                      │
│                                         │
│  [+ New Reflection]                     │
│                                         │
│  ─────────────────────────              │
│                                         │
│  January 28, 2026                       │
│  ┌───────────────────────────────────┐ │
│  │ 📖 James 1:2-4                    │ │
│  │                                   │ │
│  │ "Consider it pure joy..."         │ │
│  │                                   │ │
│  │ Personal Reflection:              │ │
│  │ This verse reminded me that       │ │
│  │ struggles are opportunities       │ │
│  │ for growth...                     │ │
│  │                                   │ │
│  │ How I Saw God Today:              │ │
│  │ In the sunrise, in my son's       │ │
│  │ laughter...                       │ │
│  │                                   │ │
│  │ [Read More →]                     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  January 27, 2026                       │
│  ┌───────────────────────────────────┐ │
│  │ 📖 Psalm 23:1                     │ │
│  │ "The Lord is my shepherd..."      │ │
│  │ [Read More →]                     │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- PrimaryButton (New Reflection)
- ReflectionCard (collapsed)
- DateHeader

User Actions:
- Tap "+ New Reflection" → Navigate to /identity/faith/new
- Tap "Read More" → Navigate to /identity/faith/[id]

Data Displayed:
- faithReflections[] (ordered by reflectionDate desc)
  - reflectionDate
  - scriptureReference
  - scriptureText (truncated)
  - personalReflection (truncated)

Navigation:
- New Reflection → /identity/faith/new
- Read More → /identity/faith/[id]
```

---

## 6. GOALS SCREENS

### Screen 6.1: Goals Overview (`/goals`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]            Goals              │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [+ New Goal]          [Filter ▼]       │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Active Goals (5)                       │
│                                         │
│  📖 Faith                               │
│  ┌───────────────────────────────────┐ │
│  │ Read Bible daily                  │ │
│  │ [=================   ] 85%        │ │
│  │ Target: Daily                     │ │
│  │ [View →]                          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  💪 Health                              │
│  ┌───────────────────────────────────┐ │
│  │ Exercise 4x per week              │ │
│  │ [==========          ] 50%        │ │
│  │ Target: Weekly                    │ │
│  │ [View →]                          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  💰 Finance                             │
│  ┌───────────────────────────────────┐ │
│  │ Save $10K emergency fund          │ │
│  │ [======              ] 30%        │ │
│  │ Target: Yearly                    │ │
│  │ [View →]                          │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- PrimaryButton (New Goal)
- FilterDropdown
- GoalCard (with category icon, progress bar)

User Actions:
- Tap "+ New Goal" → Navigate to /goals/new
- Tap "Filter" → Show dropdown (All, By Category, By Status)
- Tap goal card → Navigate to /goals/[id]

Data Displayed:
- goals[] (status = in_progress, not archived)
  - title
  - category
  - currentProgress
  - timeHorizon

Navigation:
- New Goal → /goals/new
- View Goal → /goals/[id]
```

---

### Screen 6.2: Goal Detail (`/goals/[id]`)

```
┌─────────────────────────────────────────┐
│  [← Back]          Goal Detail          │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  📖 Faith                               │
│  Read Bible daily                       │
│                                         │
│  [=================   ] 85%             │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Description                            │
│  Read one chapter of the Bible          │
│  every morning before work.             │
│                                         │
│  Success Criteria                       │
│  Complete 30 consecutive days           │
│                                         │
│  Why This Matters                       │
│  Building spiritual foundation          │
│  and starting day with purpose.         │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Progress                               │
│  Current: 85%                           │
│  Started: January 1, 2026               │
│  Target: Daily                          │
│                                         │
│  ─────────────────────────              │
│                                         │
│  [Update Progress]                      │
│  [Mark Complete]                        │
│  [Archive Goal]                         │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- CategoryIcon
- Title
- ProgressBar
- InfoSection (description, criteria, why)
- MetadataSection
- ActionButtons

User Actions:
- Tap "Update Progress" → Open modal → Enter new progress % → Call updateGoalProgress()
- Tap "Mark Complete" → Open completion reflection modal → Call completeGoal()
- Tap "Archive Goal" → Confirm → Call archiveGoal()

Data Displayed:
- goal.title
- goal.category
- goal.currentProgress
- goal.description
- goal.successCriteria
- goal.whyThisMatters
- goal.timeHorizon
- goal.createdAt

Navigation:
- Update/Complete → Refresh page with updated data
- Archive → Navigate back to /goals
```

---

## 7. ROUTINES SCREENS

### Screen 7.1: Routines Overview (`/routines`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]          Routines             │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [+ New Routine]       [Filter ▼]       │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Today's Routines                       │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🌅 Morning Routine                │ │
│  │ 6:00 AM • 60 min                  │ │
│  │ [====        ] 40% done           │ │
│  │                                   │ │
│  │ ✓ Meditation (10 min)             │ │
│  │ ✓ Exercise (30 min)               │ │
│  │ ⃞ Bible Reading (20 min)          │ │
│  │                                   │ │
│  │ [Continue →]                      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🌙 Evening Routine                │ │
│  │ 9:00 PM • 30 min                  │ │
│  │ Not started yet                   │ │
│  │ [Start →]                         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ─────────────────────────              │
│                                         │
│  All Routines                           │
│  • Morning Routine (Daily)              │
│  • Afternoon Planning (Daily)           │
│  • Weekly Review (Weekly - Sunday)      │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- PrimaryButton (New Routine)
- FilterDropdown
- RoutineCard (with completion status)
- ChecklistItems
- ActionButton

User Actions:
- Tap "+ New Routine" → Navigate to /routines/new
- Tap "Continue" → Navigate to /routines/[id]/log
- Tap routine name → Navigate to /routines/[id]

Data Displayed:
- routines[] (filtered by scheduledDays/today)
- routineItems[] (for each routine)
- Today's routineLogs (if exists)

Navigation:
- New Routine → /routines/new
- Continue/Start → /routines/[id]/log
- View Routine → /routines/[id]
```

---

### Screen 7.2: Log Routine (`/routines/[id]/log`)

```
┌─────────────────────────────────────────┐
│  [← Back]       Log Morning Routine     │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  Friday, January 29, 2026               │
│                                         │
│  Completion Level                       │
│  ( ) None                               │
│  ( ) Minimum (core items only)          │
│  (•) Ideal (all items)                  │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Routine Items                          │
│  [✓] Meditation (10 min)                │
│  [✓] Exercise (30 min)                  │
│  [✓] Bible Reading (20 min)             │
│  [✓] Journaling (optional)              │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Duration                               │
│  {65} minutes                           │
│                                         │
│  Notes (optional)                       │
│  {Felt great today. Extra energy...}    │
│  (Textarea - 3 lines)                   │
│                                         │
│                                         │
│  [Save Log →]                           │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- DateDisplay
- RadioButtons (completion level)
- Checklist (routine items)
- NumberInput (duration)
- Textarea (notes)
- PrimaryButton (Save)

User Actions:
- Select completion level
- Check completed items
- Enter duration
- Add notes
- Tap "Save Log" → Call logRoutineCompletion() → Navigate back to /routines

Validation:
- Completion level: required
- Duration: optional (default to ideal duration)
- Items: at least required items must be checked for "ideal"

Navigation:
- Save → /routines (with success message)
```

---

## 8. HABITS SCREENS

### Screen 8.1: Habits Overview (`/habits`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]           Habits              │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [+ New Habit]       [Filter ▼]         │
│                                         │
│  Tabs: [Good Habits] [Bad Habits]       │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Good Habits (3)                        │
│                                         │
│  ✓ Daily Prayer                         │
│  ┌───────────────────────────────────┐ │
│  │ 🔥 14 day streak                  │ │
│  │ Logged today ✓                    │ │
│  │ [View Details →]                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ⃞ Workout                              │
│  ┌───────────────────────────────────┐ │
│  │ Target: 4x per week               │ │
│  │ This week: 2/4                    │ │
│  │ [Log Today →]                     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ✓ Read 30 min                          │
│  ┌───────────────────────────────────┐ │
│  │ 🔥 7 day streak                   │ │
│  │ Logged today ✓                    │ │
│  │ [View Details →]                  │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- PrimaryButton (New Habit)
- FilterDropdown
- Tabs (Good/Bad)
- HabitCard (with streak, status)
- ActionButton

User Actions:
- Tap "+ New Habit" → Navigate to /habits/new
- Switch tabs → Filter by habitType
- Tap "Log Today" → Navigate to /habits/[id]/log
- Tap "View Details" → Navigate to /habits/[id]

Data Displayed:
- habits[] (filtered by habitType, isActive)
- Today's habitLogs (to show "Logged today")
- Streak calculation (consecutive days)

Navigation:
- New Habit → /habits/new
- Log → /habits/[id]/log
- View Details → /habits/[id]
```

---

### Screen 8.2: Bad Habits Tab (`/habits?type=bad`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]           Habits              │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [+ New Habit]       [Filter ▼]         │
│                                         │
│  Tabs: [Good Habits] [Bad Habits] ←     │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Bad Habits (2)                         │
│                                         │
│  ⚠ Mindless Social Media                │
│  ┌───────────────────────────────────┐ │
│  │ Target: Reduce to <30 min/day     │ │
│  │ This week: Avg 45 min/day         │ │
│  │ ↗ Trend: Increasing               │ │
│  │                                   │ │
│  │ Common Trigger: "Boredom"         │ │
│  │ [Log Today →] [View Pattern →]    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ⃞ Late Night Snacking                  │
│  ┌───────────────────────────────────┐ │
│  │ Target: Eliminate                 │ │
│  │ This week: 3 occurrences          │ │
│  │ ↘ Trend: Decreasing               │ │
│  │ [Log Today →]                     │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- Tabs (Bad selected)
- BadHabitCard (with trend indicator, triggers)
- ActionButtons

User Actions:
- Tap "Log Today" → Navigate to /habits/[id]/log (includes trigger field)
- Tap "View Pattern" → Navigate to /habits/[id] (shows trend chart)

Data Displayed:
- habits[] (habitType = 'bad')
- Weekly aggregate of logs
- Trend calculation (comparing recent vs previous week)
- Most common trigger (from logs)

Navigation:
- Log → /habits/[id]/log
- View Pattern → /habits/[id]
```

---

## 9. PEOPLE & RELATIONSHIPS

### Screen 9.1: People Overview (`/people`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]           People              │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [+ Add Person]      [Filter ▼]         │
│                                         │
│  Tabs: [All] [Inner Circle] [Exes]     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Inner Circle (3)                       │
│  ┌───────────────────────────────────┐ │
│  │ [👤] John Smith                   │ │
│  │      Friend • High Trust          │ │
│  │      Last contact: 2 days ago     │ │
│  │      Impact: Very Positive 💚      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Middle Circle (8)                      │
│  ┌───────────────────────────────────┐ │
│  │ [👤] Sarah Johnson                │ │
│  │      Business Partner             │ │
│  │      Last contact: 1 week ago     │ │
│  │      Impact: Positive 🟢          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [👤] Mike Davis                   │ │
│  │      Friend • Medium Trust        │ │
│  │      Last contact: 3 weeks ago    │ │
│  │      Impact: Neutral ⚪           │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- PrimaryButton (Add Person)
- FilterDropdown
- Tabs (All/Inner Circle/Exes)
- PersonCard (with impact color indicator)

User Actions:
- Tap "+ Add Person" → Navigate to /people/new
- Switch tabs → Filter by relationshipCircle or type
- Tap person card → Navigate to /people/[id]

Data Displayed:
- people[] (filtered by relationshipCircle, isActive)
  - firstName, lastName
  - relationshipType
  - lastContactDate
  - emotionalImpact (color-coded)
  - trustLevel

Navigation:
- Add Person → /people/new
- View Person → /people/[id]
```

---

### Screen 9.2: Person Detail (`/people/[id]`)

```
┌─────────────────────────────────────────┐
│  [← Back]          John Smith           │
├─────────────────────────────────────────┤
│  ⋮                                      │
│         [👤 Profile Photo]              │
│                                         │
│  Friend • Inner Circle                  │
│  High Trust • Very Positive Impact 💚   │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Contact Info                           │
│  📧 john.smith@email.com                │
│  📱 (555) 123-4567                      │
│                                         │
│  ─────────────────────────              │
│                                         │
│  About                                  │
│  Birthday: March 15, 1988               │
│  Met: January 2020                      │
│  Last Contact: 2 days ago               │
│                                         │
│  ─────────────────────────              │
│                                         │
│  How They Make Me Feel                  │
│  "Energized, inspired, supported"       │
│                                         │
│  What I Bring To Them                   │
│  "Accountability, honest feedback"      │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Recent Notes (5)                       │
│  [+ Add Note]                           │
│                                         │
│  January 27, 2026                       │
│  "Had coffee. Discussed his new..."     │
│  [Read More →]                          │
│                                         │
│  January 20, 2026                       │
│  "Checked in on his dad's health..."    │
│  [Read More →]                          │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- ProfilePhoto
- StatusBadges (circle, trust, impact)
- InfoSection (contact, about)
- TextBlock (feelings, contributions)
- NoteCard (collapsed)
- AddButton

User Actions:
- Tap "+ Add Note" → Navigate to /people/[id]/notes/new
- Tap "Read More" → Navigate to /people/[id]/notes/[noteId]
- Tap contact info → Open mail/phone app

Data Displayed:
- person.firstName, lastName
- person.relationshipType, relationshipCircle
- person.trustLevel, emotionalImpact
- person.phone, email
- person.birthday, dateMet, lastContactDate
- person.howTheyMakeMeFeel, whatIBringToThem
- relationshipNotes[] (recent 5)

Navigation:
- Add Note → /people/[id]/notes/new
- View Note → /people/[id]/notes/[noteId]
```

---

### Screen 9.3: Exes Tab (`/people/exes`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]           People              │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [+ Add Person]      [Filter ▼]         │
│                                         │
│  Tabs: [All] [Inner Circle] [Exes] ←   │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Past Relationships (2)                 │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [👤] Jane Doe                     │ │
│  │      Relationship: 18 months      │ │
│  │      Ended: June 2024             │ │
│  │      Healing Progress: 80%        │ │
│  │      [View Reflection →]          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [👤] Emma Wilson                  │ │
│  │      Relationship: 6 months       │ │
│  │      Ended: January 2023          │ │
│  │      Healing Progress: 100%       │ │
│  │      [View Reflection →]          │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- Tabs (Exes selected)
- ExRelationshipCard (with healing progress)
- ActionButton

User Actions:
- Tap person card → Navigate to /people/exes/[id]

Data Displayed:
- people[] (relationshipType = 'ex')
- exRelationships[] (linked to person)
  - relationshipDurationMonths
  - endedDate
  - healingProgress

Navigation:
- View Reflection → /people/exes/[id]
```

---

## 10. PRAYER SCREENS

### Screen 10.1: Prayer Overview (`/prayer`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]           Prayer              │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [+ New Prayer Request]                 │
│                                         │
│  Tabs: [Praying] [Answered] [All]      │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Active Prayers (4)                     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ For Dad's Health                  │ │
│  │ Daily • Started Jan 15            │ │
│  │ Prayed: 12 times                  │ │
│  │ Last: Yesterday                   │ │
│  │ [Log Prayer] [Mark Answered]      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ For John's Job Search             │ │
│  │ Weekly • Started Jan 1            │ │
│  │ Prayed: 4 times                   │ │
│  │ Last: 3 days ago                  │ │
│  │ [Log Prayer] [Mark Answered]      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ For Wisdom in Career Decision     │ │
│  │ As needed • Started Dec 20        │ │
│  │ Prayed: 15 times                  │ │
│  │ Last: Today                       │ │
│  │ [Log Prayer] [Mark Answered]      │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- PrimaryButton (New Prayer)
- Tabs (Praying/Answered/All)
- PrayerCard (with frequency, log count)
- ActionButtons

User Actions:
- Tap "+ New Prayer Request" → Navigate to /prayer/new
- Switch tabs → Filter by prayerStatus
- Tap "Log Prayer" → Navigate to /prayer/[id]/log
- Tap "Mark Answered" → Navigate to /prayer/[id]/mark-answered
- Tap prayer title → Navigate to /prayer/[id]

Data Displayed:
- prayerEntries[] (filtered by prayerStatus)
  - requestTitle
  - prayerFrequency
  - startedPrayingDate
  - lastPrayedDate
  - Log count (from prayerLogs)

Navigation:
- New Prayer → /prayer/new
- Log Prayer → /prayer/[id]/log
- Mark Answered → /prayer/[id]/mark-answered
- View Detail → /prayer/[id]
```

---

### Screen 10.2: Prayer Detail (`/prayer/[id]`)

```
┌─────────────────────────────────────────┐
│  [← Back]        Prayer Detail          │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  For Dad's Health                       │
│  Status: Praying 🙏                     │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Request Details                        │
│  "Praying for my dad's recovery         │
│   from surgery. For strength and        │
│   peace during this time."              │
│                                         │
│  For: Dad (Family)                      │
│  Frequency: Daily                       │
│  Started: January 15, 2026              │
│  Times Prayed: 12                       │
│  Last Prayed: Yesterday                 │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Prayer History                         │
│  January 28 • 5 min                     │
│  "Felt peace today..."                  │
│                                         │
│  January 27 • 10 min                    │
│  "Prayed for strength..."               │
│                                         │
│  January 26 • 3 min                     │
│  (View all 12 →)                        │
│                                         │
│  ─────────────────────────              │
│                                         │
│  [Log Prayer]                           │
│  [Mark Answered]                        │
│  [Archive Prayer]                       │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- Title with status badge
- InfoSection (details)
- PrayerLogList (recent logs)
- ActionButtons

User Actions:
- Tap "Log Prayer" → Navigate to /prayer/[id]/log
- Tap "Mark Answered" → Navigate to /prayer/[id]/mark-answered
- Tap "Archive Prayer" → Confirm → Call archivePrayer()

Data Displayed:
- prayerEntry.requestTitle
- prayerEntry.requestDetails
- prayerEntry.prayerStatus
- prayerEntry.prayerFrequency
- prayerEntry.startedPrayingDate
- prayerEntry.lastPrayedDate
- linked person (if personId set)
- prayerLogs[] (recent 3)
- Count of total logs

Navigation:
- Log Prayer → /prayer/[id]/log
- Mark Answered → /prayer/[id]/mark-answered
```

---

## 11. FINANCE SCREENS

### Screen 11.1: Finance Overview (`/finance`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]          Finance              │
├─────────────────────────────────────────┤
│  ⋮                                      │
│                                         │
│  Net Worth: $45,230                     │
│  ↗ +$2,340 (5.5%) this month            │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Emergency Fund                         │
│  ┌───────────────────────────────────┐ │
│  │ $5,000 / $10,000                  │ │
│  │ [==========          ] 50%        │ │
│  │ [Update →]                        │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Monthly Cash Flow                      │
│  ┌───────────────────────────────────┐ │
│  │ Income:   $6,500                  │ │
│  │ Expenses: $4,200                  │ │
│  │ Net:      +$2,300                 │ │
│  │ [View Details →]                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Quick Actions                          │
│  [+ Add Income] [+ Add Expense]         │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Navigation                             │
│  [Cash Flow] [Investments] [Insights]   │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- MetricCard (Net Worth with trend)
- ProgressCard (Emergency Fund)
- SummaryCard (Monthly Cash Flow)
- QuickActionButtons
- NavigationTiles

User Actions:
- Tap "Update" on Emergency Fund → Open modal → Call updateFinanceOverview()
- Tap "+ Add Income" → Navigate to /finance/cash-flow/new?type=income
- Tap "+ Add Expense" → Navigate to /finance/cash-flow/new?type=expense
- Tap navigation tiles → Navigate to respective pages

Data Displayed:
- finance.lastNetWorth
- finance.emergencyFundCurrent, emergencyFundTarget
- finance.monthlyIncome, monthlyExpenses
- Net calculation (income - expenses)

Navigation:
- Cash Flow → /finance/cash-flow
- Investments → /finance/investments
- Insights → /insights?filter=financial
```

---

### Screen 11.2: Cash Flow (`/finance/cash-flow`)

```
┌─────────────────────────────────────────┐
│  [← Back]         Cash Flow             │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [+ Add Entry]     [Filter: This Month] │
│                                         │
│  Tabs: [All] [Income] [Expenses]        │
│                                         │
│  ─────────────────────────              │
│                                         │
│  January 2026                           │
│  Income: $6,500 • Expenses: $4,200      │
│  Net: +$2,300                           │
│                                         │
│  ─────────────────────────              │
│                                         │
│  January 28                             │
│  ┌───────────────────────────────────┐ │
│  │ ↗ Salary                          │ │
│  │ + $3,000                          │ │
│  │ Income • Recurring                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  January 27                             │
│  ┌───────────────────────────────────┐ │
│  │ ↘ Groceries                       │ │
│  │ - $150                            │ │
│  │ Food & Dining                     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  January 26                             │
│  ┌───────────────────────────────────┐ │
│  │ ↘ Gas                             │ │
│  │ - $45                             │ │
│  │ Transportation                    │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- PrimaryButton (Add Entry)
- FilterDropdown (This Month, Last Month, Year)
- Tabs (All/Income/Expenses)
- MonthlySummary
- CashFlowEntryCard (with income/expense indicator)

User Actions:
- Tap "+ Add Entry" → Navigate to /finance/cash-flow/new
- Switch tabs → Filter by type
- Tap entry → Navigate to /finance/cash-flow/[id]

Data Displayed:
- cashFlowEntries[] (filtered by month, type)
  - entryDate
  - description
  - amount (positive for income, negative for expenses)
  - category
  - isRecurring

Navigation:
- Add Entry → /finance/cash-flow/new
- View Entry → /finance/cash-flow/[id]
```

---

## 12. BUSINESS SCREENS

### Screen 12.1: Companies Overview (`/business/companies`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]          Companies            │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [+ New Company]                        │
│                                         │
│  ─────────────────────────              │
│                                         │
│  My Companies (2)                       │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ TechCo Inc.                       │ │
│  │ Status: Active 🟢                 │ │
│  │                                   │ │
│  │ My Ownership: 60%                 │ │
│  │ Valuation: $500K                  │ │
│  │ Founded: 2022                     │ │
│  │                                   │ │
│  │ [View Details →]                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ConsultCo LLC                     │ │
│  │ Status: Active 🟢                 │ │
│  │                                   │ │
│  │ My Ownership: 100%                │ │
│  │ Valuation: $150K                  │ │
│  │ Founded: 2024                     │ │
│  │                                   │ │
│  │ [View Details →]                  │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- PrimaryButton (New Company)
- CompanyCard (with status, valuation)
- ActionButton

User Actions:
- Tap "+ New Company" → Navigate to /business/companies/new
- Tap "View Details" → Navigate to /business/companies/[id]

Data Displayed:
- companies[] (status != archived)
  - companyName
  - status
  - myOwnershipPercentage
  - currentValuation
  - foundedDate

Navigation:
- New Company → /business/companies/new
- View Details → /business/companies/[id]
```

---

### Screen 12.2: Company Detail (`/business/companies/[id]`)

```
┌─────────────────────────────────────────┐
│  [← Back]        TechCo Inc.            │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  Status: Active 🟢                      │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Overview                               │
│  Founded: January 2022                  │
│  Legal Name: TechCo Inc.                │
│  Description: SaaS platform for...      │
│                                         │
│  ─────────────────────────              │
│                                         │
│  My Position                            │
│  Ownership: 60% (600,000 shares)        │
│  Cash Invested: $50,000                 │
│  Sweat Equity: 2,000 hours              │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Financials                             │
│  Current Valuation: $500,000            │
│  Last Updated: January 2026             │
│  My Equity Value: $300,000              │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Business Model                         │
│  "B2B SaaS subscription model..."       │
│                                         │
│  Key Metrics                            │
│  "MRR: $15K, Churn: 3%, CAC: $500"      │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Navigation                             │
│  [Products] [Cap Table] [Edit Company]  │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- StatusBadge
- InfoSection (overview, position, financials)
- TextBlock (business model, metrics)
- NavigationTiles

User Actions:
- Tap "Products" → Navigate to /business/companies/[id]/products
- Tap "Cap Table" → Navigate to /business/companies/[id]/cap-table
- Tap "Edit Company" → Navigate to /business/companies/[id]/edit

Data Displayed:
- company.companyName
- company.status
- company.foundedDate, legalName, description
- company.myOwnershipPercentage, myShares
- company.cashInvested, sweatEquityHours
- company.currentValuation, lastValuationDate
- company.businessModel, keyMetrics

Navigation:
- Products → /business/companies/[id]/products
- Cap Table → /business/companies/[id]/cap-table
- Edit → /business/companies/[id]/edit
```

---

## 13. INSIGHTS SCREENS

### Screen 13.1: Insights Dashboard (`/insights`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]          Insights             │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [🔄 Refresh Insights]  [Filter ▼]      │
│                                         │
│  Tabs: [All] [High] [Medium] [Low]      │
│                                         │
│  ─────────────────────────              │
│                                         │
│  High Priority (2)                      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🚨 Discipline Decay                │ │
│  │ Detected: Today                   │ │
│  │                                   │ │
│  │ Your routine completion dropped   │ │
│  │ 35% in the past week. 2 routines  │ │
│  │ need attention.                   │ │
│  │                                   │ │
│  │ Recommended Action:               │ │
│  │ Review and simplify: Morning      │ │
│  │ Routine, Evening Reflection       │ │
│  │                                   │ │
│  │ [View Evidence →]                 │ │
│  │ [Acknowledge] [Dismiss]           │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🚨 Bad Habit Escalation            │ │
│  │ Detected: Yesterday               │ │
│  │                                   │ │
│  │ 1 bad habit is increasing.        │ │
│  │ Immediate intervention needed.    │ │
│  │                                   │ │
│  │ Primary trigger: "Boredom"        │ │
│  │                                   │ │
│  │ [View Evidence →]                 │ │
│  │ [Acknowledge] [Dismiss]           │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- RefreshButton
- FilterDropdown
- Tabs (All/High/Medium/Low)
- InsightCard (with severity badge, actions)

User Actions:
- Tap "Refresh Insights" → Call triggerManualInsightGeneration()
- Switch tabs → Filter by severity
- Tap "View Evidence" → Navigate to /insights/[id]
- Tap "Acknowledge" → Call acknowledgeInsight()
- Tap "Dismiss" → Call dismissInsight()

Data Displayed:
- insights[] (filtered by severity, not dismissed)
  - ruleCode
  - severity
  - message
  - recommendedAction
  - detectedAt

Navigation:
- View Evidence → /insights/[id]
```

---

### Screen 13.2: Insight Detail (`/insights/[id]`)

```
┌─────────────────────────────────────────┐
│  [← Back]        Insight Detail         │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  🚨 Discipline Decay                    │
│  Severity: High                         │
│  Detected: January 29, 2026             │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Message                                │
│  Your routine completion dropped 35%    │
│  in the past week. 2 routines need      │
│  attention.                             │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Recommended Action                     │
│  Review and simplify: Morning Routine,  │
│  Evening Reflection. Consider reducing  │
│  scope temporarily to rebuild momentum. │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Evidence                               │
│  • Data Points: 28 logs                 │
│  • Time Window: Past 30 days            │
│  • Drop Percentage: 35%                 │
│  • Recent Completion Rate: 42%          │
│  • Previous Completion Rate: 77%        │
│  • Slipping Routines:                   │
│    - Morning Routine                    │
│    - Evening Reflection                 │
│                                         │
│  ─────────────────────────              │
│                                         │
│  [ ] I have taken action on this        │
│  (Optional notes)                       │
│  {Textarea - 3 lines}                   │
│                                         │
│  [Mark Action Taken]                    │
│  [Acknowledge]                          │
│  [Dismiss]                              │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- InsightHeader (with severity badge)
- InfoSection (message, action)
- EvidenceList
- Checkbox
- Textarea (action notes)
- ActionButtons

User Actions:
- Check "I have taken action" → Enable textarea
- Tap "Mark Action Taken" → Call markInsightActionTaken() with notes
- Tap "Acknowledge" → Call acknowledgeInsight()
- Tap "Dismiss" → Call dismissInsight()

Data Displayed:
- insight.ruleCode
- insight.severity
- insight.detectedAt
- insight.message
- insight.recommendedAction
- insight.evidence (structured JSON)

Navigation:
- Actions redirect → /insights
```

---

## 14. ACCOUNTABILITY SCREENS

### Screen 14.1: Accountability Overview (`/accountability`)

```
┌─────────────────────────────────────────┐
│  [≡ Menu]       Accountability          │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  [+ Invite Point of Light]              │
│                                         │
│  ─────────────────────────              │
│                                         │
│  My Points of Light (2)                 │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [👤] Marcus Johnson               │ │
│  │      Active • Accepted Jan 20     │ │
│  │                                   │ │
│  │ Can see:                          │ │
│  │ • Goals • Habits (Good & Bad)     │ │
│  │ • Prayer                          │ │
│  │                                   │ │
│  │ Recent comments: 3                │ │
│  │ [View Details →]                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [👤] David Smith                  │ │
│  │      Pending • Invited Jan 28     │ │
│  │                                   │ │
│  │ Can see:                          │ │
│  │ • Goals • Routines • Habits       │ │
│  │                                   │ │
│  │ [Resend Invite] [Revoke]          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Watching (1)                           │
│  ┌───────────────────────────────────┐ │
│  │ [👤] John Williams                │ │
│  │      Invited you on Jan 25        │ │
│  │                                   │ │
│  │ You can see:                      │ │
│  │ • Goals • Finance • Business      │ │
│  │                                   │ │
│  │ [View Dashboard →]                │ │
│  └───────────────────────────────────┘ │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- TopNav
- PrimaryButton (Invite)
- AccountabilityLinkCard (with status, scopes)
- ActionButtons

User Actions:
- Tap "+ Invite Point of Light" → Navigate to /accountability/invite
- Tap "View Details" (My POLs) → Navigate to /accountability/links/[id]
- Tap "Resend Invite" → Call resendAccountabilityInvite()
- Tap "Revoke" → Call revokeAccountabilityLink()
- Tap "View Dashboard" (Watching) → Navigate to /accountability/watching/[linkId]

Data Displayed:
- accountabilityLinks[] (where ownerId = current user)
  - pointOfLight user info
  - isActive, acceptedAt
  - grantedScopes
  - Comment count
- accountabilityLinks[] (where pointOfLightId = current user)
  - owner user info
  - grantedScopes

Navigation:
- Invite → /accountability/invite
- View Details → /accountability/links/[id]
- View Dashboard → /accountability/watching/[linkId]
```

---

### Screen 14.2: Accountability Link Detail (`/accountability/links/[id]`)

```
┌─────────────────────────────────────────┐
│  [← Back]    Accountability: Marcus     │
├─────────────────────────────────────────┤
│  ⋮                                      │
│  Marcus Johnson                         │
│  marcus@email.com                       │
│  Status: Active ✓                       │
│  Accepted: January 20, 2026             │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Access Granted                         │
│  ✓ Goals                                │
│  ✓ Habits (Good & Bad)                  │
│  ✓ Prayer                               │
│  ✓ Can comment                          │
│  ✓ Receives alerts                      │
│                                         │
│  ─────────────────────────              │
│                                         │
│  Recent Comments (3)                    │
│                                         │
│  January 28 • On: Goal "Read daily"     │
│  ┌───────────────────────────────────┐ │
│  │ "Keep it up! Your consistency is  │ │
│  │  paying off."                     │ │
│  │  [Reply] [View Context →]         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  January 26 • On: Habit "Social Media"  │
│  ┌───────────────────────────────────┐ │
│  │ "🙏 Praying for you. Remember why │ │
│  │  you started."                    │ │
│  │  [Reply] [View Context →]         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  (View all 10 comments →)               │
│                                         │
│  ─────────────────────────              │
│                                         │
│  [Edit Access]                          │
│  [Revoke Access]                        │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- UserInfo (POL details)
- AccessList (scopes granted)
- CommentCard
- ActionButtons

User Actions:
- Tap "Reply" → Open reply modal
- Tap "View Context" → Navigate to entity (goal/habit)
- Tap "Edit Access" → Navigate to /accountability/links/[id]/edit
- Tap "Revoke Access" → Confirm → Call revokeAccountabilityLink()

Data Displayed:
- accountabilityLink.pointOfLight info
- accountabilityLink.isActive, acceptedAt
- accountabilityLink.grantedScopes
- accountabilityComments[] (filtered by linkId)
  - commentText
  - createdAt
  - entityType, entityId (for context)

Navigation:
- View Context → Navigate to entity
- Edit Access → /accountability/links/[id]/edit
```

---

## 15. SETTINGS SCREENS

### Screen 15.1: Settings Overview (`/settings`)

```
┌─────────────────────────────────────────┐
│  [← Back]           Settings            │
├─────────────────────────────────────────┤
│  ⋮                                      │
│                                         │
│  Account                                │
│  ┌───────────────────────────────────┐ │
│  │ Change Password                   │ │
│  │ Manage Biometric                  │ │
│  │ Email Preferences                 │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Notifications                          │
│  ┌───────────────────────────────────┐ │
│  │ Push Notifications                │ │
│  │ Notification Types                │ │
│  │ Quiet Hours                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Data & Privacy                         │
│  ┌───────────────────────────────────┐ │
│  │ Export Data                       │ │
│  │ Delete Account                    │ │
│  │ Privacy Policy                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  About                                  │
│  ┌───────────────────────────────────┐ │
│  │ Version: 1.0.0                    │ │
│  │ Terms of Service                  │ │
│  │ Contact Support                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Sign Out]                             │
│  ⋮                                      │
└─────────────────────────────────────────┘

Components Used:
- BackButton
- SettingsSectionCard (with navigation items)
- DangerButton (Sign Out)

User Actions:
- Tap any setting item → Navigate to respective page
- Tap "Sign Out" → Confirm → Call logoutUser()

Navigation:
- Change Password → /settings/password
- Manage Biometric → /settings/biometric
- Push Notifications → /settings/notifications
- Export Data → /settings/export
- Delete Account → /settings/delete-account
```

---

**END OF WIREFRAMES DOCUMENT**

All 50+ screens wireframed with complete component lists, user actions, data displayed, and navigation flows. Next: UI Components & Branding.