<script setup lang="ts">
/**
 * Fortune Wheel - Admin Panel
 * Manage wheel configuration and prizes
 */

import {
  PrizeType,
  DiscountColors,
  DiscountValues,
  LostColor,
  PrizeLabels,
  type Prize,
  type Product,
  type PrizeTypeValue,
  type DiscountValue,
} from '~/types'

// Toast notifications
const toast = useToast()

// Confirm dialog
const { confirm } = useConfirm()

// Product catalog
const productCatalog = ref<Product[]>([])

// State
const wheelPrizes = ref<Prize[]>([])
const availableSpins = ref(3)
const spinDuration = ref(4000)
const isLoading = ref(true)

// Form state
const showAddForm = ref(false)
const editingPrize = ref<Prize | null>(null)
const formType = ref<PrizeTypeValue>(PrizeType.PRODUCT)
const formProductId = ref('')
const formDiscountValue = ref(10)
const formProbability = ref(10)
const formColor = ref('#1565C0')
const productSearch = ref('')

// Preview state
const wheelRef = ref<InstanceType<typeof FortuneWheel> | null>(null)

// Computed
const totalProbability = computed(() =>
  wheelPrizes.value.reduce((sum, p) => sum + p.probability, 0),
)

const probabilityValid = computed(() => totalProbability.value === 100)

const availableProducts = computed(() =>
  productCatalog.value.filter(p =>
    !wheelPrizes.value.some(wp => wp.productId === p.id),
  ),
)

const filteredProducts = computed(() => {
  const search = productSearch.value.toLowerCase().trim()
  if (!search) return availableProducts.value
  return availableProducts.value.filter(p =>
    p.name.toLowerCase().includes(search),
  )
})

// API functions
async function loadCatalog() {
  try {
    const data = await $fetch<{ products: Product[] }>('/api/fortune-wheel/catalog')
    productCatalog.value = data.products
  }
  catch {
    toast.error('Erreur lors du chargement du catalogue')
  }
}

async function loadConfig() {
  try {
    const data = await $fetch<{ prizes: Prize[], availableSpins: number, spinDuration: number }>('/api/fortune-wheel/config')
    wheelPrizes.value = data.prizes
    availableSpins.value = data.availableSpins
    spinDuration.value = data.spinDuration || 4000
  }
  catch {
    toast.error('Erreur lors du chargement de la configuration')
  }
}

async function apiAddPrize(prize: Omit<Prize, 'id'>): Promise<Prize | null> {
  try {
    const result = await $fetch<Prize>('/api/fortune-wheel/prize', {
      method: 'POST',
      body: prize,
    })
    toast.success('Lot ajouté avec succès')
    return result
  }
  catch {
    toast.error('Erreur lors de l\'ajout du lot')
    return null
  }
}

async function apiUpdatePrize(id: string, updates: Partial<Prize>): Promise<Prize | null> {
  try {
    const result = await $fetch<Prize>(`/api/fortune-wheel/prize/${id}`, {
      method: 'PUT',
      body: updates,
    })
    toast.success('Lot modifié avec succès')
    return result
  }
  catch {
    toast.error('Erreur lors de la modification du lot')
    return null
  }
}

async function apiDeletePrize(id: string): Promise<boolean> {
  try {
    await $fetch(`/api/fortune-wheel/prize/${id}`, { method: 'DELETE' })
    toast.success('Lot supprimé')
    return true
  }
  catch {
    toast.error('Erreur lors de la suppression du lot')
    return false
  }
}

async function saveConfig() {
  try {
    await $fetch('/api/fortune-wheel/config', {
      method: 'POST',
      body: {
        availableSpins: availableSpins.value,
        spinDuration: spinDuration.value,
      },
    })
    toast.success('Configuration sauvegardée')
  }
  catch {
    toast.error('Erreur lors de la sauvegarde')
  }
}

onMounted(async () => {
  isLoading.value = true
  await Promise.all([loadCatalog(), loadConfig()])
  isLoading.value = false
})

// Form functions
function openAddForm() {
  editingPrize.value = null
  formType.value = PrizeType.PRODUCT
  formProductId.value = ''
  formDiscountValue.value = 10
  formProbability.value = 10
  formColor.value = DiscountColors[10]
  productSearch.value = ''
  showAddForm.value = true
}

function openEditForm(prize: Prize) {
  editingPrize.value = prize
  formType.value = prize.type
  formProductId.value = prize.productId || ''
  formDiscountValue.value = prize.discountValue || 10
  formProbability.value = prize.probability
  formColor.value = prize.color
  showAddForm.value = true
}

function closeForm() {
  showAddForm.value = false
  editingPrize.value = null
}

async function savePrize() {
  const prizeData = buildPrizeFromForm(editingPrize.value?.id || '')

  if (editingPrize.value) {
    const updated = await apiUpdatePrize(editingPrize.value.id, prizeData)
    if (updated) {
      const index = wheelPrizes.value.findIndex(p => p.id === editingPrize.value!.id)
      if (index !== -1) {
        wheelPrizes.value[index] = updated
      }
    }
  }
  else {
    const { id, ...newPrizeData } = prizeData
    const newPrize = await apiAddPrize(newPrizeData)
    if (newPrize) {
      wheelPrizes.value.push(newPrize)
    }
  }
  closeForm()
}

function buildPrizeFromForm(id: string): Prize {
  if (formType.value === PrizeType.PRODUCT) {
    const product = productCatalog.value.find(p => p.id === formProductId.value)!
    return {
      id,
      type: PrizeType.PRODUCT,
      productId: formProductId.value,
      name: product.name,
      image: product.image,
      probability: formProbability.value,
      color: formColor.value || product.suggestedColor,
    }
  }
  else if (formType.value === PrizeType.DISCOUNT) {
    const discountValue = formDiscountValue.value as DiscountValue
    return {
      id,
      type: PrizeType.DISCOUNT,
      name: `Bon ${discountValue}%`,
      probability: formProbability.value,
      color: formColor.value || DiscountColors[discountValue],
      discountValue,
    }
  }
  else {
    return {
      id,
      type: PrizeType.LOST,
      name: 'Perdu !',
      probability: formProbability.value,
      color: LostColor,
    }
  }
}

async function deletePrize(prizeId: string) {
  const confirmed = await confirm({
    title: 'Supprimer le lot',
    message: 'Voulez-vous vraiment supprimer ce lot de la roue ?',
    confirmText: 'Supprimer',
    cancelText: 'Annuler',
    confirmVariant: 'danger',
  })

  if (confirmed) {
    const deleted = await apiDeletePrize(prizeId)
    if (deleted) {
      wheelPrizes.value = wheelPrizes.value.filter(p => p.id !== prizeId)
    }
  }
}

function onTypeChange() {
  if (formType.value === PrizeType.PRODUCT && availableProducts.value.length > 0) {
    formProductId.value = availableProducts.value[0].id
    const product = availableProducts.value[0]
    formColor.value = product.suggestedColor
  }
  else if (formType.value === PrizeType.DISCOUNT) {
    formColor.value = DiscountColors[formDiscountValue.value as DiscountValue]
  }
  else if (formType.value === PrizeType.LOST) {
    formColor.value = LostColor
  }
}

function onDiscountChange() {
  formColor.value = DiscountColors[formDiscountValue.value as DiscountValue]
}

function onProductChange() {
  const product = productCatalog.value.find(p => p.id === formProductId.value)
  if (product) {
    formColor.value = product.suggestedColor
  }
}

function getPrizeIcon(type: PrizeTypeValue) {
  switch (type) {
    case PrizeType.PRODUCT: return '🎁'
    case PrizeType.DISCOUNT: return '🏷️'
    case PrizeType.LOST: return '❌'
    default: return '❓'
  }
}
</script>

<template>
  <div class="admin-page">
    <header class="header">
      <div class="header-content">
        <h1>Administration</h1>
        <p>Configuration de la roue de la fortune</p>
      </div>
      <NuxtLink
        to="/"
        class="btn-preview"
      >
        Voir la roue
      </NuxtLink>
    </header>

    <!-- Loading state -->
    <!-- Loading state -->
    <LoadingSpinner v-if="isLoading" />

    <main
      v-else
      class="main"
    >
      <!-- Preview -->
      <section class="preview-section">
        <h2>Apercu</h2>
        <FortuneWheel
          ref="wheelRef"
          :prizes="wheelPrizes"
          :disabled="true"
          :size="320"
        />
        <p
          v-if="!probabilityValid"
          class="warning-text"
        >
          Les probabilites doivent totaliser 100%
        </p>
      </section>

      <!-- Configuration -->
      <section class="config-section">
        <!-- Wheel settings -->
        <div class="admin-card">
          <h3>Parametres de la roue</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <label>Tours disponibles</label>
              <input
                v-model.number="availableSpins"
                type="number"
                min="1"
                max="99"
                @change="saveConfig"
              >
            </div>
            <div class="setting-item">
              <label>Duree du spin (ms)</label>
              <input
                v-model.number="spinDuration"
                type="number"
                min="1000"
                max="10000"
                step="500"
                @change="saveConfig"
              >
            </div>
          </div>
        </div>

        <!-- Prizes management -->
        <div class="admin-card">
          <div class="card-header">
            <h3>Lots configures</h3>
            <button
              class="btn-add"
              @click="openAddForm"
            >
              + Ajouter
            </button>
          </div>

          <!-- Probability indicator -->
          <div class="probability-bar">
            <div
              class="probability-fill"
              :class="{ valid: probabilityValid, invalid: !probabilityValid }"
              :style="{ width: Math.min(totalProbability, 100) + '%' }"
            />
            <span class="probability-text">
              {{ totalProbability }}% / 100%
              <span
                v-if="!probabilityValid"
                class="warning"
              >!</span>
            </span>
          </div>

          <!-- Prizes list -->
          <ul class="prizes-list">
            <li
              v-for="prize in wheelPrizes"
              :key="prize.id"
              class="prize-item"
            >
              <span
                class="prize-color"
                :style="{ background: prize.color }"
              />
              <span class="prize-icon">{{ getPrizeIcon(prize.type) }}</span>
              <span class="prize-name">{{ prize.name }}</span>
              <span class="prize-prob">{{ prize.probability }}%</span>
              <div class="prize-actions">
                <button
                  class="btn-icon"
                  title="Modifier"
                  @click="openEditForm(prize)"
                >
                  ✏️
                </button>
                <button
                  class="btn-icon"
                  title="Supprimer"
                  @click="deletePrize(prize.id)"
                >
                  🗑️
                </button>
              </div>
            </li>
          </ul>

          <p
            v-if="wheelPrizes.length === 0"
            class="empty-state"
          >
            Aucun lot configure. Cliquez sur "+ Ajouter" pour commencer.
          </p>
        </div>

        <!-- Product catalog -->
        <div class="admin-card">
          <h3>Catalogue produits</h3>
          <ul class="catalog-list">
            <li
              v-for="product in productCatalog"
              :key="product.id"
              class="catalog-item"
            >
              <span
                class="catalog-color"
                :style="{ background: product.suggestedColor }"
              />
              <span class="catalog-name">{{ product.name }}</span>
              <span
                v-if="wheelPrizes.some(p => p.productId === product.id)"
                class="catalog-badge"
              >
                Dans la roue
              </span>
            </li>
          </ul>
        </div>
      </section>
    </main>

    <!-- Add/Edit Form Modal -->
    <div
      v-if="showAddForm"
      class="modal-overlay"
      @click.self="closeForm"
    >
      <div class="modal-form">
        <h3>{{ editingPrize ? 'Modifier le lot' : 'Ajouter un lot' }}</h3>

        <div class="form-group">
          <label>Type de lot</label>
          <select
            v-model="formType"
            :disabled="!!editingPrize"
            @change="onTypeChange"
          >
            <option
              v-for="(label, type) in PrizeLabels"
              :key="type"
              :value="type"
            >
              {{ label }}
            </option>
          </select>
        </div>

        <!-- Product selection -->
        <div
          v-if="formType === PrizeType.PRODUCT"
          class="form-group"
        >
          <label>Article du catalogue</label>
          <input
            v-model="productSearch"
            type="text"
            placeholder="Rechercher un produit..."
            class="search-input"
          >
          <select
            v-model="formProductId"
            size="6"
            class="product-select"
            @change="onProductChange"
          >
            <option
              v-if="editingPrize?.productId"
              :value="editingPrize.productId"
            >
              {{ editingPrize.name }} (actuel)
            </option>
            <option
              v-for="product in filteredProducts"
              :key="product.id"
              :value="product.id"
            >
              {{ product.name }}
            </option>
          </select>
          <p
            v-if="filteredProducts.length === 0 && productSearch"
            class="form-hint"
          >
            Aucun produit trouve pour "{{ productSearch }}"
          </p>
          <p
            v-else-if="availableProducts.length === 0 && !editingPrize"
            class="form-hint warning"
          >
            Tous les articles sont deja dans la roue
          </p>
        </div>

        <!-- Discount value -->
        <div
          v-if="formType === PrizeType.DISCOUNT"
          class="form-group"
        >
          <label>Valeur du bon (%)</label>
          <select
            v-model.number="formDiscountValue"
            @change="onDiscountChange"
          >
            <option
              v-for="value in DiscountValues"
              :key="value"
              :value="value"
            >
              {{ value }}%
            </option>
          </select>
        </div>

        <!-- Probability -->
        <div class="form-group">
          <label>Probabilite (%)</label>
          <input
            v-model.number="formProbability"
            type="number"
            min="1"
            max="100"
          >
          <p class="form-hint">
            Total actuel: {{ totalProbability }}%
            → Apres: {{ totalProbability - (editingPrize?.probability || 0) + formProbability }}%
          </p>
        </div>

        <!-- Color -->
        <div class="form-group">
          <label>Couleur</label>
          <div class="color-input">
            <input
              v-model="formColor"
              type="color"
            >
            <input
              v-model="formColor"
              type="text"
              placeholder="#000000"
            >
          </div>
        </div>

        <div class="form-actions">
          <button
            class="btn-secondary"
            @click="closeForm"
          >
            Annuler
          </button>
          <button
            class="btn-primary"
            :disabled="formType === PrizeType.PRODUCT && !formProductId"
            @click="savePrize"
          >
            {{ editingPrize ? 'Enregistrer' : 'Ajouter' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 5px;
}

.header p {
  color: #888;
}

.btn-preview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  transition: transform 0.2s;
}

.btn-preview:hover {
  transform: translateY(-2px);
}

.main {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .main {
    grid-template-columns: 1fr;
  }
}

/* Preview section */
.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.preview-section h2 {
  font-size: 1.2rem;
  color: #888;
}

.warning-text {
  color: #E74C3C;
  font-size: 0.9rem;
}

/* Config section */
.config-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.admin-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
}

.admin-card h3 {
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: #ccc;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-item label {
  font-size: 0.85rem;
  color: #aaa;
}

.setting-item input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #444;
  background: #16213e;
  color: white;
  font-size: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h3 {
  margin-bottom: 0;
}

/* Buttons */
.btn-add {
  background: #2E7D32;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #388E3C;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 1;
}

.btn-primary {
  background: #4ECDC4;
  color: #1a1a2e;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #45B7D1;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #444;
  color: #fff;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #555;
}

/* Probability bar */
.probability-bar {
  height: 28px;
  background: #333;
  border-radius: 14px;
  position: relative;
  margin-bottom: 20px;
  overflow: hidden;
}

.probability-fill {
  height: 100%;
  border-radius: 14px;
  transition: width 0.3s, background 0.3s;
}

.probability-fill.valid {
  background: linear-gradient(90deg, #4ECDC4, #2E7D32);
}

.probability-fill.invalid {
  background: linear-gradient(90deg, #E74C3C, #C0392B);
}

.probability-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85rem;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.warning {
  color: #E74C3C;
  margin-left: 5px;
}

/* Prizes list */
.prizes-list {
  list-style: none;
}

.prize-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
  border-radius: 8px;
  transition: background 0.2s;
}

.prize-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.prize-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.prize-icon {
  font-size: 1rem;
}

.prize-name {
  flex: 1;
  font-size: 0.95rem;
}

.prize-prob {
  font-size: 0.9rem;
  color: #4ECDC4;
  font-weight: bold;
  min-width: 45px;
  text-align: right;
}

.prize-actions {
  display: flex;
  gap: 5px;
}

.empty-state {
  color: #666;
  text-align: center;
  padding: 30px;
}

/* Catalog list */
.catalog-list {
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
}

.catalog-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.catalog-item:last-child {
  border-bottom: none;
}

.catalog-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.catalog-name {
  flex: 1;
  font-size: 0.9rem;
  color: #aaa;
}

.catalog-badge {
  font-size: 0.75rem;
  background: #4ECDC4;
  color: #1a1a2e;
  padding: 2px 8px;
  border-radius: 10px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-form {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 420px;
  border: 1px solid #333;
}

.modal-form h3 {
  margin-bottom: 25px;
  font-size: 1.4rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #aaa;
}

.form-group select,
.form-group input[type="number"],
.form-group input[type="text"] {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #444;
  background: #16213e;
  color: white;
  font-size: 1rem;
}

.search-input {
  margin-bottom: 8px;
}

.product-select {
  height: auto;
  min-height: 150px;
}

.product-select option {
  padding: 8px 12px;
}

.form-group select:disabled {
  opacity: 0.5;
}

.form-hint {
  font-size: 0.8rem;
  color: #888;
  margin-top: 8px;
}

.form-hint.warning {
  color: #E74C3C;
}

.color-input {
  display: flex;
  gap: 10px;
}

.color-input input[type="color"] {
  width: 50px;
  height: 44px;
  padding: 2px;
  border-radius: 8px;
  border: 1px solid #444;
  background: #16213e;
  cursor: pointer;
}

.color-input input[type="text"] {
  flex: 1;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.form-actions button {
  flex: 1;
}
</style>
