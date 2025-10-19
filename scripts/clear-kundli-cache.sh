#!/bin/bash

# Clear Kundli Cache - Use this to force fresh API calls

BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

echo "🗑️  Clearing Kundli cache..."
echo "Backend URL: $BACKEND_URL"

response=$(curl -s -X GET "$BACKEND_URL/api/kundli/clear-cache")

echo "Response: $response"

if echo "$response" | grep -q "success.*true"; then
    echo "✅ Cache cleared successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Generate a new Kundli"
    echo "2. It will fetch fresh data from the API"
    echo "3. You should now see both Lagna and Navamsa charts with tabs"
else
    echo "❌ Failed to clear cache"
    echo "Response: $response"
fi
