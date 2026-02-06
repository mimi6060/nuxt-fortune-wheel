#!/bin/bash

# ===========================================
# Fortune Wheel - Docker Start Script
# ===========================================

set -e

echo "🎰 Fortune Wheel - Démarrage..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Se placer dans le bon répertoire
cd "$(dirname "$0")"

# Vérifier que Docker est lancé
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas lancé. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Arrêter les containers existants
echo -e "${YELLOW}🧹 Nettoyage des containers existants...${NC}"
docker-compose down 2>/dev/null || true
echo ""

echo -e "${BLUE}📦 Démarrage des containers Docker...${NC}"
docker-compose up -d --build

echo ""
echo -e "${YELLOW}⏳ Attente de PostgreSQL...${NC}"

# Attendre que PostgreSQL soit prêt
until docker-compose exec -T db pg_isready -U fortune -d fortune_wheel > /dev/null 2>&1; do
    echo "   En attente de la base de données..."
    sleep 2
done

echo -e "${GREEN}✅ PostgreSQL est prêt !${NC}"
echo ""

# Attendre que l'app soit prête
echo -e "${YELLOW}⏳ Attente de l'application Nuxt...${NC}"
sleep 5

# Exécuter les migrations Prisma dans le container
echo -e "${BLUE}🔧 Application du schéma Prisma...${NC}"
docker-compose exec -T -w /app/playground app npx prisma db push --skip-generate 2>/dev/null || true

# Exécuter le seed
echo -e "${BLUE}🌱 Seed de la base de données...${NC}"
docker-compose exec -T -w /app/playground app npx tsx prisma/seed.ts 2>/dev/null || echo "   (Seed déjà effectué ou en cours)"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Fortune Wheel est prêt !${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "   🌐 Application:    ${BLUE}http://127.0.0.1:3001${NC}"
echo -e "   🔍 Prisma Studio:  ${BLUE}http://127.0.0.1:5555${NC}"
echo -e "   🗄️  PostgreSQL:     ${BLUE}127.0.0.1:5433${NC}"
echo ""
echo -e "   ${YELLOW}Note: Utiliser 127.0.0.1 (pas localhost) - Docker Mac IPv6 bug${NC}"
echo ""
echo -e "   Commandes utiles:"
echo -e "   ${YELLOW}docker-compose logs -f${NC}     → Voir les logs"
echo -e "   ${YELLOW}docker-compose down${NC}        → Arrêter"
echo -e "   ${YELLOW}docker-compose restart${NC}     → Redémarrer"
echo ""
