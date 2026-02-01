#!/usr/bin/env python3
from PIL import Image

# Open original logo
img = Image.open("public/WG Logo V2.png")

# Get the bounding box of non-transparent content
bbox = img.split()[-1].getbbox()

# Crop to content
cropped = img.crop(bbox)

# Add minimal padding (10% on each side) for maskable icon safe zone
width, height = cropped.size
padding = int(width * 0.1)
padded = Image.new('RGBA', (width + padding*2, height + padding*2), (0, 0, 0, 0))
padded.paste(cropped, (padding, padding))

# Create different sizes
padded.resize((512, 512), Image.Resampling.LANCZOS).save("public/icon-512x512-maskable.png")
padded.resize((192, 192), Image.Resampling.LANCZOS).save("public/icon-192x192-maskable.png")
padded.resize((180, 180), Image.Resampling.LANCZOS).save("public/apple-touch-icon.png")

# Also create versions without extra padding for regular icons
cropped.resize((512, 512), Image.Resampling.LANCZOS).save("public/icon-512x512.png")
cropped.resize((192, 192), Image.Resampling.LANCZOS).save("public/icon-192x192.png")

print("✅ Icons created with cropped logo (fills entire space)")
print("   - Maskable icons: 10% safe zone padding")
print("   - Regular icons: Full bleed")
