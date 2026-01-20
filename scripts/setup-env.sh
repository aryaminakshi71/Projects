#!/bin/bash

# ============================================================================
# Environment Setup Script
# ============================================================================
# This script helps set up and manage environment variables for the project
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🔧 Environment Setup Script"
echo "=========================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✓ .env.local already exists"
    read -p "Do you want to backup .env.local before proceeding? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        BACKUP_FILE=".env.local.backup.$(date +%Y%m%d_%H%M%S)"
        cp .env.local "$BACKUP_FILE"
        echo "✓ Backed up to $BACKUP_FILE"
    fi
else
    echo "📝 Creating .env.local from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✓ Created .env.local"
        echo ""
        echo "⚠️  IMPORTANT: Edit .env.local and fill in your actual values!"
        echo "   Required variables:"
        echo "   - JWT_SECRET (min 32 characters)"
        echo "   - JWT_REFRESH_SECRET (min 32 characters)"
        echo "   - DATABASE_URL or DB_* variables"
        echo "   - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN"
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

# Generate JWT secrets if not set
if ! grep -q "JWT_SECRET=your-super-secret" .env.local 2>/dev/null; then
    echo ""
    echo "✓ JWT secrets appear to be configured"
else
    echo ""
    read -p "Generate new JWT secrets? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v openssl &> /dev/null; then
            JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
            JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
            
            # Update .env.local
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env.local
                sed -i '' "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" .env.local
            else
                # Linux
                sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env.local
                sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|" .env.local
            fi
            echo "✓ Generated and updated JWT secrets"
        else
            echo "⚠️  openssl not found. Please generate secrets manually:"
            echo "   openssl rand -base64 32"
        fi
    fi
fi

# Check for required variables
echo ""
echo "🔍 Checking required environment variables..."
echo ""

REQUIRED_VARS=("JWT_SECRET" "JWT_REFRESH_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env.local 2>/dev/null; then
        VALUE=$(grep "^${var}=" .env.local | cut -d '=' -f2-)
        if [[ "$VALUE" == *"your-"* ]] || [[ "$VALUE" == *"change-in-production"* ]] || [ -z "$VALUE" ]; then
            MISSING_VARS+=("$var")
            echo "  ⚠️  $var: Not configured (using placeholder)"
        else
            echo "  ✓ $var: Configured"
        fi
    else
        MISSING_VARS+=("$var")
        echo "  ❌ $var: Missing"
    fi
done

# Check database configuration
if grep -q "^DATABASE_URL=" .env.local 2>/dev/null; then
    DB_URL=$(grep "^DATABASE_URL=" .env.local | cut -d '=' -f2-)
    if [[ "$DB_URL" == *"postgresql://user:password"* ]]; then
        echo "  ⚠️  DATABASE_URL: Not configured (using placeholder)"
    else
        echo "  ✓ DATABASE_URL: Configured"
    fi
elif grep -q "^DB_HOST=" .env.local 2>/dev/null; then
    echo "  ✓ Database: Using individual DB_* variables"
else
    echo "  ⚠️  Database: No configuration found"
fi

# Check Redis configuration
if grep -q "^UPSTASH_REDIS_REST_URL=" .env.local 2>/dev/null; then
    REDIS_URL=$(grep "^UPSTASH_REDIS_REST_URL=" .env.local | cut -d '=' -f2-)
    if [[ "$REDIS_URL" == *"your-redis-instance"* ]]; then
        echo "  ⚠️  Redis: Not configured (using placeholder)"
    else
        echo "  ✓ Redis: Configured"
    fi
else
    echo "  ⚠️  Redis: No configuration found"
fi

echo ""
if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "✅ All required variables are configured!"
else
    echo "⚠️  Please configure the following variables in .env.local:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
fi

echo ""
echo "📋 Next steps:"
echo "   1. Review and update .env.local with your actual values"
echo "   2. Ensure .env.local is in .gitignore (already done)"
echo "   3. Never commit .env.local to version control"
echo ""
echo "✨ Setup complete!"
