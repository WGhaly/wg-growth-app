# PWA Icon Setup Instructions

## Current Status
✅ WG Logo.png is set as the PWA icon in:
- `/public/manifest.json` - All icon sizes now point to WG Logo.png
- `/app/layout.tsx` - Metadata icons updated

## Golden Color Updated
The accent/golden color has been changed from #B08968 to #ccab52 throughout the application:
- `app/globals.css` - CSS variables
- `tailwind.config.ts` - Tailwind theme colors
- `lib/email.ts` - Email template colors
- All component files with hardcoded colors

## Recommended: Generate Optimized Icon Sizes

While the app will work with the single WG Logo.png file, for best PWA experience, generate these optimized sizes:

### Required Sizes:
1. **favicon.ico** - 16x16, 32x32, 48x48 (multi-resolution ICO file)
2. **icon-192x192.png** - 192×192px (Android home screen)
3. **icon-512x512.png** - 512×512px (Android splash screen)
4. **apple-touch-icon.png** - 180×180px (iOS home screen)

### How to Generate:

#### Option 1: Using ImageMagick (Command Line)
```bash
# Install ImageMagick if not already installed
brew install imagemagick

# Generate 192x192
magick "WG Logo.png" -resize 192x192 icon-192x192.png

# Generate 512x512
magick "WG Logo.png" -resize 512x512 icon-512x512.png

# Generate 180x180 for iOS
magick "WG Logo.png" -resize 180x180 apple-touch-icon.png

# Generate favicon (multi-resolution ICO)
magick "WG Logo.png" -resize 48x48 favicon-48.png
magick "WG Logo.png" -resize 32x32 favicon-32.png
magick "WG Logo.png" -resize 16x16 favicon-16.png
magick favicon-16.png favicon-32.png favicon-48.png favicon.ico
rm favicon-16.png favicon-32.png favicon-48.png
```

#### Option 2: Using Online Tools
1. Visit https://realfavicongenerator.net/
2. Upload WG Logo.png
3. Configure colors:
   - Theme Color: #ccab52
   - Background: #0F0F0F
4. Download generated package
5. Replace files in `/public/` directory

#### Option 3: Using PWA Asset Generator
```bash
npx @vite-pwa/assets-generator --preset minimal public/WG\ Logo.png
```

### After Generating Icons:
1. Place generated files in `/public/` directory
2. Update `/public/manifest.json` to use the new icon filenames:
   ```json
   "icons": [
     {
       "src": "/icon-192x192.png",
       "sizes": "192x192",
       "type": "image/png",
       "purpose": "any maskable"
     },
     {
       "src": "/icon-512x512.png",
       "sizes": "512x512",
       "type": "image/png",
       "purpose": "any maskable"
     }
   ]
   ```
3. Update `/app/layout.tsx`:
   ```typescript
   icons: {
     icon: '/favicon.ico',
     apple: '/apple-touch-icon.png',
     shortcut: '/favicon.ico'
   }
   ```

## Testing PWA Icons

1. **Desktop (Chrome/Edge):**
   - Open DevTools → Application → Manifest
   - Check if icons load correctly

2. **iOS (Safari):**
   - Add to Home Screen
   - Check icon appears correctly

3. **Android (Chrome):**
   - Menu → Add to Home Screen
   - Check icon appears correctly

## Color Verification

All instances of the old golden color (#B08968) have been replaced with #ccab52:
- ✅ CSS Variables (globals.css)
- ✅ Tailwind Config
- ✅ Email Templates
- ✅ Component Files (Goals, Routines)
- ✅ PWA Manifest theme_color
- ✅ Background color in manifest

## Current Files Using New Color

### CSS/Config Files:
- `app/globals.css` - --accent-primary, --accent-hover, --accent-active
- `tailwind.config.ts` - accent.primary, accent.hover, accent.active

### Email Templates:
- `lib/email.ts` - All header backgrounds, buttons, and links

### Components:
- `components/goals/GoalCard.tsx`
- `components/goals/CreateGoalModal.tsx`
- `components/goals/GoalsClient.tsx`
- `components/routines/RoutinesClient.tsx`
- `components/routines/CreateRoutineModal.tsx`
- `components/routines/RoutineCard.tsx`

### PWA Files:
- `public/manifest.json` - theme_color, background_color
- `app/layout.tsx` - Icon references

## Notes

- The WG Logo.png is already in the `/public/` directory
- The app will scale the logo automatically for different sizes
- For production, properly sized icons are recommended for better performance
- iOS requires at least 180×180px for proper rendering
- Android prefers 192×192px and 512×512px
