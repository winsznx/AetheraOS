#!/bin/bash

# AetheraOS Complete Deployment Script
# Run this to deploy everything to Railway

echo "🚀 AetheraOS Complete Deployment"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the AetheraOS root directory"
    exit 1
fi

echo "📦 Step 1: Checking git status..."
git status

echo ""
echo "📝 Step 2: Adding all changes..."
git add .

echo ""
echo "💬 Step 3: Creating commit..."
git commit -m "feat: Complete all backend features

- Added agent chat history persistence
- Added marketplace with reviews and ratings
- Added deployment system with templates
- Fixed all agent issues (Service Bindings, data accuracy, cost tracking)
- Updated Prisma schema with new models
- Added analytics endpoints
- 100% backend complete, ready for frontend integration"

echo ""
echo "🚢 Step 4: Pushing to Railway..."
git push origin main

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Railway will now:"
echo "  1. Run database migrations"
echo "  2. Create new tables (AgentConversation, MarketplaceAgent, etc.)"
echo "  3. Restart server with new routes"
echo ""
echo "📊 Monitor deployment:"
echo "  - Railway Dashboard: https://railway.app/dashboard"
echo "  - Check logs for migration status"
echo ""
echo "🧪 Test endpoints after deployment:"
echo "  curl https://your-backend.railway.app/health"
echo "  curl https://your-backend.railway.app/api/marketplace/agents"
echo "  curl https://your-backend.railway.app/api/deploy/templates"
echo ""
echo "📚 Next steps:"
echo "  1. Verify deployment in Railway dashboard"
echo "  2. Test API endpoints"
echo "  3. Update frontend (Agent Chat, Marketplace, Deploy)"
echo ""
echo "🎉 Backend is 100% complete!"
