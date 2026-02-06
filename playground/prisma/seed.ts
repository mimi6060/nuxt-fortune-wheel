// Seed script for Fortune Wheel database - 48 Sitadis products
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Parse connection string and add SSL config
const connectionUrl = new URL(process.env.DATABASE_URL!)
const pool = new pg.Pool({
  host: connectionUrl.hostname,
  port: Number(connectionUrl.port) || 5432,
  database: connectionUrl.pathname.slice(1),
  user: connectionUrl.username,
  password: decodeURIComponent(connectionUrl.password),
  ssl: {
    rejectUnauthorized: false,
  },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const SITADIS_IMG = 'https://www.sitadis.be/ressources/ebusiness/4'

// Color palette for products
const colors = [
  '#2E7D32', '#C62828', '#1565C0', '#6A1B9A', '#E65100',
  '#00838F', '#AD1457', '#4527A0', '#283593', '#1B5E20',
  '#BF360C', '#4E342E', '#37474F', '#827717', '#F57F17',
  '#FF6F00', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#D32F2F',
  '#7B1FA2', '#512DA8', '#303F9F', '#1976D2', '#0288D1',
  '#0097A7', '#00796B', '#388E3C', '#689F38', '#AFB42B',
  '#FBC02D', '#FFA000', '#F57C00',
]

// All 48 products from Sitadis ALCOOLS category
const productsData = [
  { code: '406030', name: 'CYNAR 16.5% 1L', ext: 'JPG' },
  { code: '402050', name: 'CENTERBA 70% 50CL', ext: 'JPG' },
  { code: '402023', name: 'AMARO DIGESTIVO 30° 70CL', ext: 'jpg' },
  { code: 'CAMP1', name: 'CAMPARI 25% 1L', ext: 'jpg' },
  { code: 'CAFF010', name: 'GRAPPA MORBIDA 40% 70CL', ext: 'jpg' },
  { code: 'CAFF013', name: 'GRAPPA VECCHIA 12M 40% 70CL', ext: 'JPG' },
  { code: 'GANC003', name: 'GANCIA APERITIVO 14.5% 75CL', ext: 'JPG' },
  { code: 'HAVA002', name: 'RHUM BRUN ESPECIAL 37.5° 1L', ext: 'jpg' },
  { code: 'MART05', name: 'MARTINI ROSSO 14.5% 1.5L', ext: 'jpg' },
  { code: 'MART06', name: 'MARTINI BIANCO 14.5% 1.5L', ext: 'jpg' },
  { code: 'SAMB001', name: 'SAMBUCA EXTRA 40% 1L', ext: 'jpg' },
  { code: 'PORT001', name: 'PORTO WHITE 19.5° 75CL', ext: 'jpg' },
  { code: 'PORT002', name: 'PORTO TAWNY 19° 75CL', ext: 'jpg' },
  { code: 'RICA001', name: 'RICARD PASTIS 45% 1L', ext: 'jpg' },
  { code: 'BAIL001', name: 'BAILEYS 17° 1L', ext: 'jpg' },
  { code: 'PISA001', name: 'PISANG FUNNY 0°C 70CL', ext: 'jpg' },
  { code: 'COGN001', name: 'COGNAC FINE CUISINE 30° 1L', ext: 'jpg' },
  { code: 'CASS001', name: 'CREME CASSIS 16° 70CL', ext: 'jpg' },
  { code: 'PINE001', name: 'PINEAU CHARENTES BLANC 17° 75CL', ext: 'jpg' },
  { code: 'VECC001', name: 'VECCHIA ROMAGNA BRANDY 38° 1L', ext: 'jpg' },
  { code: 'AMAR001', name: 'AMARETTO 28% 1L', ext: 'jpg' },
  { code: 'COIN001', name: 'COINTREAU 40° 1L', ext: 'jpg' },
  { code: 'GORD001', name: 'GIN GORDONS 37.5% 1L', ext: 'jpg' },
  { code: 'JWRE001', name: 'WHISKY J.WALKER RED 40% 1L', ext: 'jpg' },
  { code: 'WHJB001', name: 'WHISKY JB 40% 1L', ext: 'jpg' },
  { code: 'BATI001', name: 'BATIDA DE COCO 16° 1L', ext: 'jpg' },
  { code: 'PICO001', name: 'PICON AMER 21% 1L', ext: 'jpg' },
  { code: 'RHBL001', name: 'RHUM BLANC CARTA BLANCA 37.5% 1L', ext: 'jpg' },
  { code: 'WILL001', name: 'WILLIAM LAWSONS WHISKY 40° 1L', ext: 'jpg' },
  { code: 'FERN002', name: 'FERNET BRANCA MENTHE 28° 70CL', ext: 'jpg' },
  { code: 'FERN001', name: 'FERNET BRANCA 35% 70CL', ext: 'jpg' },
  { code: 'JACK001', name: 'WHISKY JACK DANIELS 40% 1L', ext: 'jpg' },
  { code: 'PISA002', name: 'PISANG AMBON 17% 1L', ext: 'jpg' },
  { code: 'PASS001', name: 'PASSOA 17° 1L', ext: 'jpg' },
  { code: 'CAPO001', name: 'AMARO DEL CAPO 35% 1L', ext: 'jpg' },
  { code: 'CAPO003', name: 'AMARO DEL CAPO 35% 3L BOIS', ext: 'jpg' },
  { code: 'CAPO002', name: 'AMARO DEL CAPO 35% 70CL', ext: 'jpg' },
  { code: 'CAPO004', name: 'AMARO DEL CAPO COFFRET 70CL', ext: 'jpg' },
  { code: 'CAPO005', name: 'AMARO DEL CAPO RISERVA 37.5% 70CL', ext: 'jpg' },
  { code: 'CAPO006', name: 'AMARO DEL CAPO RED HOT 35% 70CL', ext: 'jpg' },
  { code: 'VODK001', name: 'VODKA 37.5° 1L', ext: 'jpg' },
  { code: 'CALV001', name: 'CALVADOS GRAND SOLAGE 40° 70CL', ext: 'jpg' },
  { code: 'MONT001', name: 'AMARO MONTENEGRO 23% 70CL', ext: 'jpg' },
  { code: 'ROSS001', name: 'ROSSO ANTICO VIN CUIT 16° 75CL', ext: 'jpg' },
  { code: 'GRAN001', name: 'GRAND MARNIER 40% 70CL', ext: 'jpg' },
  { code: 'SICI001', name: 'AMARO SICILIEN 29% 70CL', ext: 'jpg' },
  { code: 'SAMB002', name: 'SAMBUCA BIANCA 40% 70CL', ext: 'jpg' },
  { code: 'AMAR002', name: 'AMARETTO 21% 70CL', ext: 'jpg' },
]

async function main() {
  console.log('Seeding database with 48 Sitadis products...')

  // Delete existing data
  await prisma.prize.deleteMany()
  await prisma.wheelConfig.deleteMany()
  await prisma.product.deleteMany()

  // Create all products
  const products = await Promise.all(
    productsData.map((p, index) =>
      prisma.product.create({
        data: {
          id: p.code,
          name: p.name,
          image: `${SITADIS_IMG}/${p.code}/${p.code}.${p.ext}`,
          suggestedColor: colors[index % colors.length],
        },
      }),
    ),
  )

  console.log(`Created ${products.length} products`)

  // Create wheel config with a selection of prizes
  const config = await prisma.wheelConfig.create({
    data: {
      name: 'default',
      availableSpins: 3,
      spinDuration: 4000,
      isActive: true,
      prizes: {
        create: [
          // 3 Products (15% total)
          {
            type: 'product',
            productId: 'CAMP1',
            name: 'CAMPARI 25% 1L',
            image: `${SITADIS_IMG}/CAMP1/CAMP1.jpg`,
            probability: 5,
            color: '#C62828',
          },
          {
            type: 'product',
            productId: 'CAPO001',
            name: 'AMARO DEL CAPO 35% 1L',
            image: `${SITADIS_IMG}/CAPO001/CAPO001.jpg`,
            probability: 5,
            color: '#1565C0',
          },
          {
            type: 'product',
            productId: 'JACK001',
            name: 'WHISKY JACK DANIELS 40% 1L',
            image: `${SITADIS_IMG}/JACK001/JACK001.jpg`,
            probability: 5,
            color: '#4E342E',
          },
          // 3 Discounts (55% total)
          {
            type: 'discount',
            name: 'Bon 15%',
            probability: 10,
            color: '#7B1FA2',
            discountValue: 15,
          },
          {
            type: 'discount',
            name: 'Bon 10%',
            probability: 20,
            color: '#00838F',
            discountValue: 10,
          },
          {
            type: 'discount',
            name: 'Bon 5%',
            probability: 25,
            color: '#F57C00',
            discountValue: 5,
          },
          // Lost (30%)
          {
            type: 'lost',
            name: 'Perdu !',
            probability: 30,
            color: '#424242',
          },
        ],
      },
    },
    include: { prizes: true },
  })

  console.log(`Created wheel config with ${config.prizes.length} prizes`)
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
