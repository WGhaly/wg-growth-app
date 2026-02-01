#!/usr/bin/env python3
from PIL import Image

# Open original logo
img = Image.open("public/WG Logo V2.png")

# Get the bounding box of non-transparent content
bbox = img.split()[-1].getbbox()

# Crop to content
cropped = img.crop(bbox)

# For each icon size, create a version that's 110% of the icon size
def create_icon_with_overflow(size):
    # Scale the cropped logo to 110% of target size
    scaled_size = int(size * 1.1)
    scaled = cropped.resize((scaled_size, scaled_size), Image.Resampling.LANCZOS)
    
    # Center crop to the target size (creates 10% overflow effect)
    overflow = (scaled_size - size) // 2
    final = scaled.crop((overflow, overflow, overflow + size, overflow + size))
    
    return final

# Create all icon sizes
create_icon_with_overflow(512).save("public/icon-512x512-maskable.png")
create_icon_with_overflow(192).save("public/icon-192x192-maskable.png")
create_icon_with_overflow(180).save("public/apple-touch-icon.png")
create_icon_with_overflow(512).save("public/icon-512x512.png")
create_icon_with_overflow(192).save("public/icon-192x192.png")

print("✅ Icons created at 110% scale (10% overflow on all sides)")
print("   - Logo completely fills icon with slight overflow")

