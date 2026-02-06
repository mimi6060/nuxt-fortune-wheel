# 🎰 Nuxt Fortune Wheel

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Module Nuxt pour intégrer une roue de la fortune interactive avec gestion des lots, probabilités et génération de QR codes.

## Fonctionnalités

- 🎡 **Roue interactive** - Animation fluide avec rotation réaliste
- 🎁 **Gestion des lots** - Articles, bons de réduction ou "Perdu"
- 📊 **Probabilités configurables** - Définissez les chances de gagner chaque lot
- 🔢 **Compteur de tours** - Limitez le nombre de parties par client
- 🎉 **Animation de victoire** - Modal avec confettis et message personnalisé
- 📱 **QR Code** - Généré automatiquement pour validation en caisse
- 🔌 **API-driven** - Toute la configuration vient de votre backend

---

## Installation

```bash
npm install nuxt-fortune-wheel
```

Ajoutez le module à votre `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-fortune-wheel'],

  fortuneWheel: {
    // Configuration optionnelle
    apiEndpoint: '/api/fortune-wheel/config'
  }
})
```

---

## Configuration avec Variables d'Environnement

Copiez le fichier `.env.example` vers `.env` et configurez vos valeurs :

```bash
cp .env.example .env
```

### Variables disponibles

| Variable | Défaut | Description |
|----------|--------|-------------|
| `FORTUNE_WHEEL_API_URL` | `http://localhost:3000` | URL de base de votre API backend |
| `FORTUNE_WHEEL_CATALOG_ENDPOINT` | `/api/fortune-wheel/catalog` | Endpoint pour récupérer le catalogue produits |
| `FORTUNE_WHEEL_CONFIG_ENDPOINT` | `/api/fortune-wheel/config` | Endpoint pour la configuration de la roue |
| `FORTUNE_WHEEL_PRIZE_ENDPOINT` | `/api/fortune-wheel/prize` | Endpoint pour gérer les lots |
| `FORTUNE_WHEEL_SPIN_DURATION` | `4000` | Durée de l'animation de rotation (ms) |
| `FORTUNE_WHEEL_QR_VALIDITY_HOURS` | `24` | Durée de validité du QR code (heures) |

### Exemple `.env`

```bash
# Production
FORTUNE_WHEEL_API_URL=https://api.votresite.com

# Développement local
FORTUNE_WHEEL_API_URL=http://localhost:3000
```

### Utilisation dans nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-fortune-wheel'],

  fortuneWheel: {
    apiUrl: process.env.FORTUNE_WHEEL_API_URL,
    catalogEndpoint: process.env.FORTUNE_WHEEL_CATALOG_ENDPOINT,
    configEndpoint: process.env.FORTUNE_WHEEL_CONFIG_ENDPOINT,
    prizeEndpoint: process.env.FORTUNE_WHEEL_PRIZE_ENDPOINT,
    spinDuration: Number(process.env.FORTUNE_WHEEL_SPIN_DURATION) || 4000,
    qrValidityHours: Number(process.env.FORTUNE_WHEEL_QR_VALIDITY_HOURS) || 24
  }
})
```

---

## API Backend - Documentation Complète

Le module nécessite une API backend pour gérer la configuration de la roue. Voici la documentation complète des endpoints et structures de données.

### Types de Lots

La roue supporte 3 types de lots :

| Type | Description | Icône |
|------|-------------|-------|
| `product` | Article physique du catalogue | 🎁 |
| `discount` | Bon de réduction en pourcentage | 🏷️ |
| `lost` | Case "Perdu" (pas de gain) | ❌ |

---

### Structures de Données

#### Product (Article du catalogue)

```typescript
interface Product {
  id: string              // Identifiant unique (ex: "PROD001")
  name: string            // Nom du produit (ex: "CYNAR 16.5% 1L")
  image?: string          // URL de l'image (optionnel)
  suggestedColor: string  // Couleur suggérée pour la roue (hex)
}
```

**Exemple :**
```json
{
  "id": "PROD001",
  "name": "CYNAR 16.5% 1L",
  "image": "https://example.com/images/cynar.jpg",
  "suggestedColor": "#2E7D32"
}
```

#### Prize (Lot de la roue)

```typescript
interface Prize {
  id: string                        // Identifiant unique
  type: "product" | "discount" | "lost"  // Type de lot
  productId?: string                // Référence au catalogue (pour type "product")
  name: string                      // Nom affiché sur la roue
  image?: string                    // URL de l'image (optionnel)
  probability: number               // Probabilité en % (1-100)
  color: string                     // Couleur du segment (hex)
  discountValue?: number            // Valeur du bon (pour type "discount")
}
```

**Exemples par type :**

```json
// Type "product" - Article physique
{
  "id": "1",
  "type": "product",
  "productId": "PROD001",
  "name": "CYNAR 16.5% 1L",
  "image": "https://example.com/images/cynar.jpg",
  "probability": 5,
  "color": "#2E7D32",
  "discountValue": null
}

// Type "discount" - Bon de réduction
{
  "id": "2",
  "type": "discount",
  "productId": null,
  "name": "Bon 10%",
  "image": null,
  "probability": 25,
  "color": "#1565C0",
  "discountValue": 10
}

// Type "lost" - Perdu
{
  "id": "3",
  "type": "lost",
  "productId": null,
  "name": "Perdu !",
  "image": null,
  "probability": 30,
  "color": "#424242",
  "discountValue": null
}
```

#### WheelConfig (Configuration complète)

```typescript
interface WheelConfig {
  prizes: Prize[]         // Liste des lots (total probabilités = 100%)
  availableSpins: number  // Nombre de tours disponibles pour le client
  spinDuration?: number   // Durée de l'animation en ms (défaut: 4000)
}
```

---

### Endpoints API

#### GET `/api/fortune-wheel/catalog`

Retourne la liste des produits disponibles pouvant être ajoutés à la roue.

**Response :**
```json
{
  "products": [
    {
      "id": "PROD001",
      "name": "CYNAR 16.5% 1L",
      "image": "https://example.com/images/cynar.jpg",
      "suggestedColor": "#2E7D32"
    },
    {
      "id": "PROD002",
      "name": "CAMPARI 25% 1L",
      "image": "https://example.com/images/campari.jpg",
      "suggestedColor": "#C62828"
    },
    {
      "id": "PROD003",
      "name": "GRAPPA MORBIDA",
      "image": "https://example.com/images/grappa.jpg",
      "suggestedColor": "#F57F17"
    }
  ]
}
```

---

#### GET `/api/fortune-wheel/config`

Retourne la configuration actuelle de la roue.

**Response :**
```json
{
  "prizes": [
    {
      "id": "1",
      "type": "product",
      "productId": "PROD001",
      "name": "CYNAR 16.5% 1L",
      "image": "https://example.com/images/cynar.jpg",
      "probability": 5,
      "color": "#2E7D32",
      "discountValue": null
    },
    {
      "id": "2",
      "type": "product",
      "productId": "PROD002",
      "name": "CAMPARI 25% 1L",
      "image": "https://example.com/images/campari.jpg",
      "probability": 10,
      "color": "#C62828",
      "discountValue": null
    },
    {
      "id": "3",
      "type": "discount",
      "productId": null,
      "name": "Bon 10%",
      "image": null,
      "probability": 25,
      "color": "#1565C0",
      "discountValue": 10
    },
    {
      "id": "4",
      "type": "discount",
      "productId": null,
      "name": "Bon 5%",
      "image": null,
      "probability": 30,
      "color": "#6A1B9A",
      "discountValue": 5
    },
    {
      "id": "5",
      "type": "lost",
      "productId": null,
      "name": "Perdu !",
      "image": null,
      "probability": 30,
      "color": "#424242",
      "discountValue": null
    }
  ],
  "availableSpins": 3,
  "spinDuration": 4000
}
```

---

#### POST `/api/fortune-wheel/config`

Met à jour la configuration complète de la roue.

**Request Body :**
```json
{
  "prizes": [...],
  "availableSpins": 3,
  "spinDuration": 4000
}
```

**Response :** `200 OK` avec la configuration mise à jour.

---

#### POST `/api/fortune-wheel/prize`

Ajoute un nouveau lot à la roue.

**Request Body (Article) :**
```json
{
  "type": "product",
  "productId": "PROD003",
  "probability": 8,
  "color": "#F57F17"
}
```

**Request Body (Bon de réduction) :**
```json
{
  "type": "discount",
  "discountValue": 15,
  "probability": 20,
  "color": "#00838F"
}
```

**Request Body (Perdu) :**
```json
{
  "type": "lost",
  "probability": 25
}
```

**Response :** `201 Created` avec le lot créé (incluant l'id généré).

---

#### PUT `/api/fortune-wheel/prize/:id`

Modifie un lot existant.

**Request Body :**
```json
{
  "probability": 15,
  "color": "#FF5722"
}
```

**Response :** `200 OK` avec le lot modifié.

---

#### DELETE `/api/fortune-wheel/prize/:id`

Supprime un lot de la roue.

**Response :** `204 No Content`

---

### Valeurs de Réduction Suggérées

| Valeur | Couleur suggérée |
|--------|------------------|
| 5% | `#6A1B9A` (violet) |
| 10% | `#1565C0` (bleu) |
| 15% | `#00838F` (cyan) |
| 20% | `#2E7D32` (vert) |
| 25% | `#F9A825` (jaune) |
| 30% | `#EF6C00` (orange) |

---

## Props des Composants

### FortuneWheel

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `prizes` | Prize[] | `[]` | Liste des lots |
| `disabled` | boolean | `false` | Désactive la roue |
| `size` | number | `400` | Taille en pixels |
| `spinDuration` | number | `4000` | Durée de rotation en ms |
| `selectedPrizeIndex` | number | `null` | Force un résultat (pour tests) |

### Events FortuneWheel

| Event | Payload | Description |
|-------|---------|-------------|
| `spin-start` | - | Déclenché au début de la rotation |
| `spin-end` | `(prize, index)` | Déclenché à la fin avec le lot gagné |
| `spin-request` | `(index)` | Déclenché quand l'utilisateur clique sur la roue |

### WinModal

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `show` | boolean | `false` | Affiche/masque le modal |
| `prize` | Prize | `null` | Lot gagné à afficher |
| `qrCode` | string | `null` | Données pour le QR code |
| `message` | string | `"Présentez ce QR code..."` | Message sous le QR |

---

## Exemple Complet

```vue
<template>
  <div class="fortune-game">
    <div class="spins-info">
      Tours restants: {{ availableSpins }}
    </div>

    <FortuneWheel
      ref="wheel"
      :prizes="config.prizes"
      :disabled="availableSpins <= 0 || isSpinning"
      :size="380"
      @spin-start="onSpinStart"
      @spin-end="onSpinEnd"
      @spin-request="onSpinRequest"
    />

    <button
      :disabled="availableSpins <= 0 || isSpinning"
      @click="spin"
    >
      Tourner la roue!
    </button>

    <WinModal
      :show="showWinModal"
      :prize="currentPrize"
      :qr-code="qrCode"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
const wheel = ref(null)
const isSpinning = ref(false)
const showWinModal = ref(false)
const currentPrize = ref(null)
const qrCode = ref(null)
const availableSpins = ref(0)
const config = ref({ prizes: [] })

// Charger la config depuis l'API
onMounted(async () => {
  const response = await $fetch('/api/fortune-wheel/config')
  config.value = response
  availableSpins.value = response.availableSpins
})

function spin() {
  if (availableSpins.value <= 0) return
  const prizeIndex = wheel.value.selectRandomPrizeIndex()
  onSpinRequest(prizeIndex)
}

function onSpinRequest(prizeIndex) {
  currentPrize.value = config.value.prizes[prizeIndex]

  // Générer le QR code avec les infos du lot
  qrCode.value = btoa(JSON.stringify({
    prizeId: currentPrize.value.id,
    prizeName: currentPrize.value.name,
    prizeType: currentPrize.value.type,
    discountValue: currentPrize.value.discountValue,
    timestamp: Date.now(),
    validUntil: Date.now() + 24 * 60 * 60 * 1000
  }))

  wheel.value.spinToIndex(prizeIndex)
}

function onSpinStart() {
  isSpinning.value = true
}

function onSpinEnd(prize) {
  isSpinning.value = false
  availableSpins.value--

  if (prize.type !== 'lost') {
    showWinModal.value = true
  }
}

function closeModal() {
  showWinModal.value = false
}
</script>
```

---

## Validation du QR Code (Côté Caisse)

Le QR code contient un JSON encodé en base64 :

```javascript
// Décoder le QR code
const qrData = JSON.parse(atob(scannedQrCode))

console.log(qrData)
// {
//   prizeId: "1",
//   prizeName: "CYNAR 16.5% 1L",
//   prizeType: "product",
//   discountValue: null,
//   timestamp: 1707234567890,
//   validUntil: 1707320967890
// }

// Pour un bon de réduction :
// {
//   prizeId: "3",
//   prizeName: "Bon 10%",
//   prizeType: "discount",
//   discountValue: 10,
//   timestamp: 1707234567890,
//   validUntil: 1707320967890
// }

// Vérifier la validité
if (Date.now() > qrData.validUntil) {
  console.log('QR code expiré!')
  return
}

// Appliquer le gain selon le type
if (qrData.prizeType === 'product') {
  // Offrir le produit
  console.log(`Produit gagné: ${qrData.prizeName}`)
} else if (qrData.prizeType === 'discount') {
  // Appliquer la réduction
  console.log(`Réduction de ${qrData.discountValue}% à appliquer`)
}
```

---

## Personnalisation du Style

Les composants utilisent des classes CSS que vous pouvez surcharger :

```css
/* Roue */
.fortune-wheel-wrapper { }
.fortune-wheel-canvas { }
.fortune-wheel-pointer { }

/* Modal */
.win-modal-overlay { }
.win-modal { }
.win-modal-title { }
.win-modal-prize { }
.win-modal-qr { }
```

---

## Développement Local avec Docker

Le playground inclut une configuration Docker complète avec PostgreSQL et Prisma Studio.

### Démarrage rapide

```bash
cd playground

# Démarrer tout (PostgreSQL + App + Prisma Studio + Seed)
./start.sh

# Arrêter
./stop.sh
```

### Services Docker

| Service | Container | Port | URL |
|---------|-----------|------|-----|
| **App Nuxt** | `fortune-wheel-app` | 3001 | http://localhost:3001 |
| **PostgreSQL** | `fortune-wheel-db` | 5433 | `localhost:5433` |
| **Prisma Studio** | `fortune-wheel-studio` | 5555 | http://localhost:5555 |

### Variables d'environnement

Fichier `playground/.env` :

```bash
# PostgreSQL (port 5433 pour éviter conflit)
DATABASE_URL=postgresql://fortune:fortune_secret@localhost:5433/fortune_wheel
```

---

## Schéma de Base de Données (Prisma)

Le playground utilise PostgreSQL avec Prisma. Voici le schéma complet :

### Product (Catalogue produits)

```prisma
model Product {
  id             String   @id @default(cuid())
  name           String
  image          String?
  suggestedColor String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  prizes         Prize[]
}
```

**Exemple de données :**

| id | name | image | suggestedColor |
|----|------|-------|----------------|
| PROD001 | CYNAR 16.5% 1L | https://... | #2E7D32 |
| PROD002 | CAMPARI 25% 1L | https://... | #C62828 |

### Prize (Lots de la roue)

```prisma
model Prize {
  id            String      @id @default(cuid())
  type          PrizeType   // product, discount, lost
  name          String
  image         String?
  probability   Int         // 1-100 (%)
  color         String      // Hex color
  discountValue Int?        // Pour type "discount"
  productId     String?     // Référence Product
  wheelConfigId String      // Référence WheelConfig
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum PrizeType {
  product
  discount
  lost
}
```

**Exemple de données :**

| type | name | probability | color | discountValue |
|------|------|-------------|-------|---------------|
| product | CYNAR 16.5% 1L | 5 | #2E7D32 | null |
| discount | Bon 10% | 25 | #1565C0 | 10 |
| lost | Perdu ! | 30 | #424242 | null |

### WheelConfig (Configuration roue)

```prisma
model WheelConfig {
  id             String   @id @default(cuid())
  name           String   @default("default") @unique
  availableSpins Int      @default(3)
  spinDuration   Int      @default(4000)  // ms
  isActive       Boolean  @default(true)
  prizes         Prize[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## Commandes Prisma

```bash
cd playground

# Générer le client Prisma
npm run db:generate

# Appliquer le schéma à la DB
npm run db:push

# Créer une migration
npm run db:migrate

# Seed initial (8 produits + 5 lots)
npm run db:seed

# Interface admin Prisma (port 5555)
npm run db:studio

# Reset complet (efface tout + reseed)
npm run db:reset
```

---

## Développement sans Docker

```bash
# Installer les dépendances
npm install

# Préparer le module
npm run dev:prepare

# Lancer le playground (données en mémoire)
npm run dev

# Build pour production
npm run prepack
```

---

## License

MIT

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-fortune-wheel/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-fortune-wheel

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-fortune-wheel.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-fortune-wheel

[license-src]: https://img.shields.io/npm/l/nuxt-fortune-wheel.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-fortune-wheel

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
