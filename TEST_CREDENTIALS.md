# WG Growth App - Test Credentials & Access Guide

## 🚀 Quick Start

### 1. Start the Development Server

```bash
cd "/Users/waseemghaly/Documents/PRG/Emad/Personal Projects/WG Growth App"
pnpm dev
```

The server will start on **http://localhost:3000** (or 3001/3002 if 3000 is in use)

---

## 🔐 Test Account Credentials

### Demo Account (Just Created)
```
Email: demo@wglifeos.com
Password: Demo@Password123!
Name: Test User
```

**Note:** This account needs email verification. To bypass verification:

```bash
psql -h localhost -U waseemghaly -d wg_life_os -c \
"UPDATE users SET \"emailVerified\" = NOW() WHERE email = 'demo@wglifeos.com';"
```

---

## 📝 Creating a New Test Account

If you need to create a fresh account:

1. Navigate to: http://localhost:3000/auth/register
2. Fill in the form:
   - First Name: (your choice)
   - Last Name: (your choice)
   - Email: (your choice)
   - Date of Birth: 1990-01-01
   - Password: Must be 12+ chars with uppercase, lowercase, number, and special character
   - Example: `Test@Password123!`

3. After registration, verify email using database:
   ```bash
   psql -h localhost -U waseemghaly -d wg_life_os -c \
   "UPDATE users SET \"emailVerified\" = NOW() WHERE email = 'YOUR_EMAIL@example.com';"
   ```

---

## 🧪 Testing the New Navigation System

Once logged in, test these features:

### Desktop Navigation (Screen > 1024px)
1. ✅ Verify **sidebar appears on left** (256px width)
2. ✅ Click each navigation link (13 modules)
3. ✅ Verify **active state highlights** current page
4. ✅ Check **back button appears** in header (except on dashboard)
5. ✅ Click back button to return to previous page

### Mobile Navigation (Screen < 768px)
1. ✅ Verify sidebar is hidden
2. ✅ Click **hamburger menu (☰)** in top-right
3. ✅ Verify **drawer slides in from right**
4. ✅ Click a navigation link
5. ✅ Verify drawer closes automatically
6. ✅ Verify **back button appears** in mobile header (except dashboard)

### Navigation Links to Test (13 Modules)
- 🏠 Dashboard → `/dashboard`
- 🎯 Goals → `/goals`
- 📈 Habits → `/habits`
- 📅 Routines → `/routines`
- ❤️ Prayer → `/faith`
- 👥 Relationships → `/relationships`
- 💰 Finance → `/finance`
- 💼 Business → `/business`
- 📖 Life Seasons → `/life-seasons`
- 🛡️ Accountability → `/accountability`
- 👤 Identity → `/identity`
- 💡 Insights → `/insights`
- 🔔 Notifications → `/notifications`
- 👤 Profile → `/profile`

### Color Contrast Testing
1. ✅ Verify all text is **readable** (light on dark)
2. ✅ Check forms and modals
3. ✅ Verify buttons are **visible** and have good contrast
4. ✅ Test hover states (should change color noticeably)

---

## 🔧 Troubleshooting

### Server Won't Start
```bash
# Kill existing servers
pkill -f "next dev"
pkill -f "pnpm dev"

# Wait and restart
sleep 2
cd "/Users/waseemghaly/Documents/PRG/Emad/Personal Projects/WG Growth App"
pnpm dev
```

### Login Fails - User Not Found
The account may not exist. Register a new one at:
http://localhost:3000/auth/register

### Login Fails - Email Not Verified
Verify the email using database:
```bash
psql -h localhost -U waseemghaly -d wg_life_os -c \
"UPDATE users SET \"emailVerified\" = NOW() WHERE email = 'YOUR_EMAIL';"
```

### Port Already in Use
If port 3000 is in use, Next.js will automatically try:
- Port 3001
- Port 3002
- etc.

Check the terminal output for the actual port:
```
Local: http://localhost:XXXX
```

---

## 📱 Responsive Testing Sizes

Test the navigation at these breakpoints:

| Device | Width | Expected Behavior |
|--------|-------|-------------------|
| iPhone SE | 375px | Mobile menu (hamburger) |
| iPhone 12/13 | 390px | Mobile menu |
| iPad Mini | 768px | Mobile menu |
| iPad Pro | 1024px | Desktop sidebar appears |
| Laptop | 1280px | Desktop sidebar |
| Desktop | 1920px+ | Desktop sidebar |

---

## 🎨 Color Theme Reference

The app uses a dark theme:

| Element | Color | Hex |
|---------|-------|-----|
| Primary BG | bg-bg-primary | #0F0F0F |
| Secondary BG | bg-bg-secondary | #1A1A1A |
| Primary Text | text-text-primary | #F5F5F5 |
| Secondary Text | text-text-secondary | #B3B3B3 |
| Accent | accent-primary | #B08968 |

All text should be light (#F5F5F5 or #B3B3B3) on dark backgrounds (#0F0F0F or #1A1A1A).

---

## ✅ Testing Checklist

After logging in, verify:

- [ ] Can see navigation sidebar (desktop) or hamburger menu (mobile)
- [ ] All 13 module links work
- [ ] Back button appears on all pages except dashboard
- [ ] Back button goes to previous page
- [ ] Active page is highlighted with accent color
- [ ] All text is readable (good contrast)
- [ ] Forms and buttons are visible
- [ ] Hover states work
- [ ] Mobile drawer opens/closes smoothly
- [ ] Navigation works on mobile and desktop
- [ ] Responsive layout adapts at different sizes

---

## 🐛 Known Issues

### Email Verification Required
After registration, emails are not sent (no email service configured). 
**Solution:** Manually verify in database using the SQL command above.

### Test Files Have Errors
Some test files show TypeScript errors, but these don't affect the running application.

---

## 📚 Documentation

- [NAVIGATION_INTEGRATION_COMPLETE.md](./NAVIGATION_INTEGRATION_COMPLETE.md) - Full integration details
- [UX_UI_IMPROVEMENTS_SUMMARY.md](./UX_UI_IMPROVEMENTS_SUMMARY.md) - Complete UX/UI fixes overview
- [E2E_TEST_RESULTS.md](./E2E_TEST_RESULTS.md) - E2E test coverage results

---

## 💡 Quick Tips

1. **Clear cache if styles don't load:** Hard refresh (Cmd+Shift+R on Mac)
2. **Check the console:** Open DevTools (F12) to see any errors
3. **Mobile testing:** Use DevTools device toolbar (Cmd+Shift+M on Mac)
4. **Color contrast:** Use DevTools to inspect element colors

---

## 🎉 What's New

### Navigation System ✅
- Desktop sidebar with all modules
- Mobile hamburger menu
- Back button on all pages (except dashboard)
- Active state highlighting

### Color Contrast Fixed ✅
- Replaced all dark gray text with light colors
- Proper contrast ratios (WCAG AA compliant)
- Fixed buttons, forms, and hover states

### Mobile-First Design ✅
- Responsive at all breakpoints
- Touch-friendly targets (44px minimum)
- Proper spacing and layout

### Push Notifications ✅
- Full implementation in NotificationSettings
- Service worker registered
- Push subscription management

---

**Ready to test! Start the server and navigate to http://localhost:3000** 🚀
