#!/bin/bash

# Vercel API script to add DATABASE_URL environment variable
# Usage: bash add-database-url.sh

echo "🔧 Adding DATABASE_URL to Vercel..."
echo ""

# Configuration
PROJECT_NAME="tinedy-crm"
TEAM_ID="jirawatpyk-4879"
DATABASE_URL="postgres://3c0aef1ac6dd46da8a553c5ba079d7996f47e5138a9ce750b4c7efc78cf28125:sk_UJMLL5NrHejcYVsQwPT9V@db.prisma.io:5432/postgres?sslmode=require"

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN is not set"
  echo ""
  echo "Please get your Vercel token from:"
  echo "https://vercel.com/account/tokens"
  echo ""
  echo "Then run:"
  echo "export VERCEL_TOKEN=your_token_here"
  echo "bash add-database-url.sh"
  exit 1
fi

echo "📡 Adding DATABASE_URL to Vercel project: $PROJECT_NAME"
echo ""

# Add environment variable using Vercel API
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_NAME/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "DATABASE_URL",
    "value": "'"$DATABASE_URL"'",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }' | jq .

echo ""
echo "✅ Done! Now redeploy your project to apply changes."
echo ""
echo "Run: git commit --allow-empty -m 'Update env vars' && git push"
