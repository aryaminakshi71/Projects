#!/bin/bash

# ============================================================================
# Environment Variables Checker
# ============================================================================
# Checks which environment variables are used in the codebase
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🔍 Environment Variables Checker"
echo "================================"
echo ""

# Find all process.env references
echo "📝 Scanning codebase for environment variables..."
echo ""

ENV_VARS=$(grep -r "process\.env\." --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src shared-saas-core 2>/dev/null | \
    grep -o "process\.env\.[A-Z_][A-Z0-9_]*" | \
    sed 's/process\.env\.//' | \
    sort -u)

echo "Found environment variables in codebase:"
echo "----------------------------------------"
echo "$ENV_VARS" | while read -r var; do
    if [ -n "$var" ]; then
        # Check if it's in .env.example
        if grep -q "^${var}=" .env.example 2>/dev/null; then
            echo "  ✓ $var (documented in .env.example)"
        else
            echo "  ⚠️  $var (not in .env.example)"
        fi
    fi
done

echo ""
echo "📋 Variables in .env.example:"
echo "----------------------------"
if [ -f ".env.example" ]; then
    grep -E "^[A-Z_][A-Z0-9_]*=" .env.example 2>/dev/null | cut -d '=' -f1 | while read -r var; do
        if echo "$ENV_VARS" | grep -q "^${var}$"; then
            echo "  ✓ $var (used in code)"
        else
            echo "  ⚠️  $var (not found in codebase - may be optional)"
        fi
    done
else
    echo "  ❌ .env.example not found"
fi

echo ""
echo "✨ Check complete!"
