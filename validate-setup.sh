#!/bin/bash
# Setup and Validation Script for IT Portal
# This script helps verify the repository setup

echo "=== IT Portal Repository Validation ==="
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the repository root"
    exit 1
fi

echo "✅ Repository structure:"
echo ""

# Verify essential files
files=(
    ".gitignore"
    ".dockerignore"
    "Dockerfile"
    "docker-compose.yml"
    "CONTRIBUTING.md"
    ".env.example"
)

missing_files=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (missing)"
        missing_files=$((missing_files + 1))
    fi
done

# Verify directories
echo ""
echo "✅ Directory structure:"
dirs=("src" "docker" "docs" "data")
missing_dirs=0
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✓ $dir/"
    else
        echo "  ✗ $dir/ (missing)"
        missing_dirs=$((missing_dirs + 1))
    fi
done

echo ""
echo "=== Version Control Status ==="
git status -s

echo ""
echo "=== Git Configuration ==="
echo "Current branch: $(git branch --show-current)"
echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'Not configured')"

echo ""
if [ $missing_files -eq 0 ] && [ $missing_dirs -eq 0 ]; then
    echo "✅ Repository setup is complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Copy .env.example to .env and configure"
    echo "  2. Start development with: docker-compose up -d"
    echo "  3. View logs with: docker-compose logs -f"
    echo "  4. Read CONTRIBUTING.md for development guidelines"
else
    echo "⚠️  Setup incomplete. Missing $missing_files files and $missing_dirs directories"
    exit 1
fi
