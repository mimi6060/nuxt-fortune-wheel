#!/bin/bash

# ===========================================
# Fortune Wheel - Docker Stop Script
# ===========================================

cd "$(dirname "$0")"

echo "🛑 Arrêt de Fortune Wheel..."
docker-compose down

echo "✅ Containers arrêtés."
echo ""
echo "💡 Pour supprimer aussi les données PostgreSQL:"
echo "   docker-compose down -v"
