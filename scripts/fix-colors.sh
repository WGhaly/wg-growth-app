#!/bin/bash

# Color Fix Script for WG Growth App
# This script replaces Tailwind default gray colors with custom theme colors
# to ensure proper contrast on dark backgrounds

echo "🎨 Fixing color contrast issues in WG Growth App..."

# Define the root directory
ROOT_DIR="/Users/waseemghaly/Documents/PRG/Emad/Personal Projects/WG Growth App"

# Text color replacements
echo "📝 Fixing text colors..."

# Primary text (most visible)
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/text-gray-900/text-text-primary/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/text-gray-100/text-text-primary/g' {} +

# Secondary text (less emphasized)
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/text-gray-600/text-text-secondary/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/text-gray-700/text-text-secondary/g' {} +

# Tertiary text (subtle/muted)
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/text-gray-500/text-text-tertiary/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/text-gray-400/text-text-tertiary/g' {} +

# Background color replacements
echo "🎨 Fixing background colors..."

# Light backgrounds that need to be dark
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/bg-gray-50/bg-bg-secondary/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/bg-gray-100/bg-bg-secondary/g' {} +

# Medium backgrounds
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/bg-gray-200/bg-bg-tertiary/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/bg-gray-800/bg-bg-secondary/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/bg-gray-900/bg-bg-primary/g' {} +

# Border color replacements
echo "🖼️  Fixing border colors..."

find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/border-gray-200/border-border-default/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/border-gray-300/border-border-default/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/border-gray-700/border-border-default/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/border-gray-800/border-border-default/g' {} +

# Hover state replacements
echo "✨ Fixing hover states..."

find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/hover:bg-gray-100/hover:bg-bg-secondary/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/hover:bg-gray-50/hover:bg-bg-secondary/g' {} +
find "$ROOT_DIR/app" "$ROOT_DIR/components" -name "*.tsx" -type f -exec sed -i '' 's/hover:text-gray-900/hover:text-text-primary/g' {} +

echo "✅ Color fixes complete!"
echo ""
echo "Summary of changes:"
echo "  - text-gray-900/100 → text-text-primary"
echo "  - text-gray-600/700 → text-text-secondary"
echo "  - text-gray-500/400 → text-text-tertiary"
echo "  - bg-gray-50/100 → bg-bg-secondary"
echo "  - bg-gray-800/900 → bg-bg-primary/secondary"
echo "  - border-gray-* → border-border-default"
echo ""
echo "Please review the changes and test the application!"
