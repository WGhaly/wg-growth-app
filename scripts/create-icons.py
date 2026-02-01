#!/usr/bin/env python3
from PIL import Image

# Open original logo
img = Image.open("public/WG Logo V2.png")

# Get the bounding box of non-transparent content
bbox = img.split()[-1].getbbox()

# Crop to content
cropped = img.crop(bbox)

# Scale up the cropped image by 120% so it overflows and fills completely
width, height = cropped.size
new_width = int(width * 1.2)
new_height = int(height * 1.2)
scaled = cropped.resize((new_width, new_height), Image.Resampling.LANCZOS)

# Center crop to get back to original cropped size (creates overflow effect)
left = (new_width - width) // 2
top = (new_height - height) // 2
overflowed = scaled.crop((left, top, left + width, top + height))

# Create all icon sizes from the overflowed version (fills entire space)
overflowed.resize((512, 512), Image.Resampling.LANCZOS).save("public/icon-512x512-maskable.png")
overflowed.resize((192, 192), Image.Resampling.LANCZOS).save("public/icon-192x192-maskable.png")
overflowed.resize((180, 180), Image.Resampling.LANCZOS).save("public/apple-touch-icon.png")
overflowed.resize((512, 512), Image.Resampling.LANCZOS).save("public/icon-512x512.png")
overflowed.resize((192, 192), Image.Resampling.LANCZOS).save("public/icon-192x192.png")

print("✅ Icons created with 120% scaled logo (overflows to fill entire space)")
print("   - Logo is bigger and completely fills the icon")
print("   - No empty space around edges")
