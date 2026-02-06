<script setup lang="ts">
/**
 * FortuneWheel Component - Professional Canvas-based wheel
 * Inspired by wheelofnames.com and casino-style designs
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Prize } from '../types'

interface Props {
  prizes: Prize[]
  spinning?: boolean
  disabled?: boolean
  size?: number
  spinDuration?: number
  selectedPrizeIndex?: number | null
  pointerAngle?: number // 0 = top, 90 = right, etc.
}

const props = withDefaults(defineProps<Props>(), {
  spinning: false,
  disabled: false,
  size: 400,
  spinDuration: 4000,
  selectedPrizeIndex: null,
  pointerAngle: 0,
})

const emit = defineEmits<{
  spinStart: []
  spinEnd: [prize: Prize, index: number]
  spinRequest: [index: number]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentRotation = ref(0)
const isAnimating = ref(false)
const imagesLoaded = ref<Map<string, HTMLImageElement>>(new Map())

// Default vibrant colors
const defaultColors = [
  '#E74C3C', '#3498DB', '#2ECC71', '#F39C12',
  '#9B59B6', '#1ABC9C', '#E91E63', '#00BCD4',
  '#FF5722', '#607D8B', '#8BC34A', '#FF9800',
]

const segmentAngle = computed(() => (2 * Math.PI) / props.prizes.length)

// Preload images (client-side only)
watch(() => props.prizes, async (newPrizes) => {
  // Skip on server-side
  if (typeof window === 'undefined') return

  for (const prize of newPrizes) {
    if (prize.image && !imagesLoaded.value.has(prize.image)) {
      const img = new window.Image()
      // Note: crossOrigin removed to allow images from servers without CORS headers
      img.onload = () => {
        imagesLoaded.value.set(prize.image!, img)
        drawWheel()
      }
      img.onerror = () => {
        console.warn(`Failed to load image: ${prize.image}`)
      }
      img.src = prize.image
    }
  }
  drawWheel()
}, { immediate: true, deep: true })

// Redraw on rotation change
watch(currentRotation, () => {
  drawWheel()
})

onMounted(() => {
  drawWheel()
  window.addEventListener('resize', drawWheel)
})

onUnmounted(() => {
  window.removeEventListener('resize', drawWheel)
})

function drawWheel() {
  // Skip on server-side
  if (typeof window === 'undefined') return

  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = props.size
  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2 - 15

  // Clear canvas
  ctx.clearRect(0, 0, size, size)

  // Save context for rotation
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate((currentRotation.value * Math.PI) / 180)
  ctx.translate(-centerX, -centerY)

  // Draw outer decorative ring
  drawOuterRing(ctx, centerX, centerY, radius + 10)

  // Draw segments
  props.prizes.forEach((prize, index) => {
    const startAngle = index * segmentAngle.value - Math.PI / 2
    const endAngle = startAngle + segmentAngle.value
    const color = prize.color || defaultColors[index % defaultColors.length]

    // Draw segment
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()

    // Gradient fill for depth
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius,
    )
    gradient.addColorStop(0, lightenColor(color, 30))
    gradient.addColorStop(0.5, color)
    gradient.addColorStop(1, darkenColor(color, 20))
    ctx.fillStyle = gradient
    ctx.fill()

    // Segment border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw text and image
    drawSegmentContent(ctx, prize, index, centerX, centerY, radius)
  })

  ctx.restore()

  // Draw center button (doesn't rotate)
  drawCenterButton(ctx, centerX, centerY)
}

function drawOuterRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  // Outer golden ring
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
  const ringGradient = ctx.createRadialGradient(cx, cy, radius - 15, cx, cy, radius)
  ringGradient.addColorStop(0, '#B8860B')
  ringGradient.addColorStop(0.5, '#FFD700')
  ringGradient.addColorStop(1, '#B8860B')
  ctx.strokeStyle = ringGradient
  ctx.lineWidth = 12
  ctx.stroke()

  // Decorative dots/lights
  const numDots = props.prizes.length * 2
  for (let i = 0; i < numDots; i++) {
    const angle = (i / numDots) * 2 * Math.PI - Math.PI / 2
    const dotX = cx + Math.cos(angle) * (radius + 2)
    const dotY = cy + Math.sin(angle) * (radius + 2)

    ctx.beginPath()
    ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI)
    ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#FFFFFF'
    ctx.fill()
    ctx.strokeStyle = '#B8860B'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

function drawSegmentContent(
  ctx: CanvasRenderingContext2D,
  prize: Prize,
  index: number,
  cx: number,
  cy: number,
  radius: number,
) {
  // Middle angle of segment (0 = right, -π/2 = top, going clockwise)
  const midAngle = index * segmentAngle.value + segmentAngle.value / 2 - Math.PI / 2

  // Calculate actual angle after wheel rotation
  const rotationRad = (currentRotation.value * Math.PI) / 180
  const actualAngle = midAngle + rotationRad

  // Is segment currently pointing left? Use cosine: negative = left side
  const isLeftSide = Math.cos(actualAngle) < 0

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(midAngle)

  // Draw image near center
  if (prize.image && imagesLoaded.value.has(prize.image)) {
    const img = imagesLoaded.value.get(prize.image)!
    const imgSize = 28
    const imgDist = radius * 0.35

    ctx.save()
    ctx.translate(imgDist, 0)
    ctx.rotate(-midAngle) // Counter-rotate to keep image upright

    // White circle background
    ctx.beginPath()
    ctx.arc(0, 0, imgSize / 2 + 2, 0, 2 * Math.PI)
    ctx.fillStyle = 'white'
    ctx.fill()

    // Clip and draw
    ctx.beginPath()
    ctx.arc(0, 0, imgSize / 2, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize)
    ctx.restore()
  }

  // Draw text RADIALLY (along the spoke), CENTERED in the segment
  const text = prize.name
  const innerRadius = prize.image ? radius * 0.52 : radius * 0.22
  const outerRadius = radius * 0.88
  const availableLength = outerRadius - innerRadius
  const centerRadius = (innerRadius + outerRadius) / 2

  // Calculate font size to fit
  let fontSize = 11
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  while (ctx.measureText(text).width > availableLength && fontSize > 7) {
    fontSize--
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
  }

  // Text style
  ctx.fillStyle = '#FFFFFF'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
  ctx.shadowBlur = 3
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1

  // Position text at centerRadius along the spoke
  // For left side, we need to flip text 180° so it reads from outside toward center
  ctx.save()
  ctx.translate(centerRadius, 0)
  if (isLeftSide) {
    ctx.rotate(Math.PI)
  }
  ctx.fillText(text, 0, 0)
  ctx.restore()

  ctx.restore()
}

function drawCenterButton(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const buttonRadius = props.size * 0.1

  // Outer shadow
  ctx.beginPath()
  ctx.arc(cx, cy, buttonRadius + 3, 0, 2 * Math.PI)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fill()

  // Button gradient
  const gradient = ctx.createRadialGradient(
    cx - buttonRadius / 3, cy - buttonRadius / 3, 0,
    cx, cy, buttonRadius,
  )
  gradient.addColorStop(0, '#FFFFFF')
  gradient.addColorStop(0.3, '#F5F5F5')
  gradient.addColorStop(1, '#CCCCCC')

  ctx.beginPath()
  ctx.arc(cx, cy, buttonRadius, 0, 2 * Math.PI)
  ctx.fillStyle = gradient
  ctx.fill()

  // Golden border
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 4
  ctx.stroke()

  // Inner border
  ctx.beginPath()
  ctx.arc(cx, cy, buttonRadius - 4, 0, 2 * Math.PI)
  ctx.strokeStyle = '#B8860B'
  ctx.lineWidth = 2
  ctx.stroke()

  // Text
  ctx.fillStyle = '#333'
  ctx.font = `bold ${buttonRadius * 0.5}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'transparent'
  ctx.fillText(props.disabled ? '---' : 'SPIN', cx, cy)
}

function lightenColor(color: string, percent: number): string {
  const num = Number.parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
  const B = Math.min(255, (num & 0x0000FF) + amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

function darkenColor(color: string, percent: number): string {
  const num = Number.parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt)
  const B = Math.max(0, (num & 0x0000FF) - amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

// Animation using requestAnimationFrame for smoothness
let _animationId: number | null = null

function spinToIndex(targetIndex: number) {
  if (isAnimating.value) return

  isAnimating.value = true
  emit('spinStart')

  const startRotation = currentRotation.value
  const segmentDeg = 360 / props.prizes.length

  // Calculate the rotation needed to CENTER the target segment under the pointer (at 0°/right)
  // The middle of segment 0 is at angle: -90° + segmentDeg/2 = -67.5° (from right)
  // To put the middle of segment i under the pointer (0°), we need rotation:
  // rotation = 90 - segmentDeg/2 - i * segmentDeg
  const targetAngle = 90 - segmentDeg / 2 - targetIndex * segmentDeg

  // Ensure we spin at least 5 full rotations in the positive direction
  let targetRotation = targetAngle
  while (targetRotation < startRotation + 5 * 360) {
    targetRotation += 360
  }

  const startTime = performance.now()
  const duration = props.spinDuration

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing: cubic-bezier like deceleration
    const easeOut = 1 - Math.pow(1 - progress, 4)

    currentRotation.value = startRotation + (targetRotation - startRotation) * easeOut

    if (progress < 1) {
      _animationId = requestAnimationFrame(animate)
    }
    else {
      isAnimating.value = false
      _animationId = null
      emit('spinEnd', props.prizes[targetIndex], targetIndex)
    }
  }

  _animationId = requestAnimationFrame(animate)
}

function handleClick() {
  if (props.disabled || isAnimating.value || props.prizes.length === 0) return

  if (props.selectedPrizeIndex === null) {
    const randomIndex = selectRandomPrizeIndex()
    // Emit event so parent can set up prize/QR code before spinning
    emit('spinRequest', randomIndex)
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}

// Computed for accessibility
const ariaLabel = computed(() => {
  if (props.disabled) {
    return 'Roue de la fortune - désactivée'
  }
  if (isAnimating.value) {
    return 'Roue de la fortune - en cours de rotation'
  }
  return `Roue de la fortune avec ${props.prizes.length} lots. Appuyez sur Entrée ou Espace pour tourner.`
})

const prizeListDescription = computed(() => {
  return props.prizes.map(p => p.name).join(', ')
})

function selectRandomPrizeIndex(): number {
  const random = Math.random() * 100
  let cumulative = 0

  for (let i = 0; i < props.prizes.length; i++) {
    cumulative += props.prizes[i].probability
    if (random <= cumulative) {
      return i
    }
  }

  return props.prizes.length - 1
}

defineExpose({
  spinToIndex,
  selectRandomPrizeIndex,
})
</script>

<template>
  <div
    class="fortune-wheel-wrapper"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="application"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
  >
    <!-- Screen reader description of prizes -->
    <div
      id="prize-list-description"
      class="sr-only"
    >
      Lots disponibles: {{ prizeListDescription }}
    </div>
    <!-- Pointer (right side, 3 o'clock position) -->
    <div class="fortune-wheel-pointer">
      <svg
        width="50"
        height="40"
        viewBox="0 0 50 40"
      >
        <defs>
          <linearGradient
            id="pointerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              style="stop-color:#FFD700"
            />
            <stop
              offset="50%"
              style="stop-color:#FFA500"
            />
            <stop
              offset="100%"
              style="stop-color:#FF8C00"
            />
          </linearGradient>
          <filter
            id="pointerShadow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx="2"
              dy="2"
              stdDeviation="3"
              flood-color="#000"
              flood-opacity="0.4"
            />
          </filter>
        </defs>
        <!-- Arrow pointing left -->
        <polygon
          points="0,20 45,5 45,35"
          fill="url(#pointerGradient)"
          stroke="#B8860B"
          stroke-width="2"
          filter="url(#pointerShadow)"
        />
        <circle
          cx="38"
          cy="20"
          r="5"
          fill="#FFD700"
          stroke="#B8860B"
          stroke-width="1"
        />
      </svg>
    </div>

    <!-- Canvas Wheel -->
    <canvas
      ref="canvasRef"
      :width="size"
      :height="size"
      class="fortune-wheel-canvas"
      :class="{ 'fortune-wheel-canvas--disabled': disabled }"
      role="img"
      :aria-label="ariaLabel"
      aria-describedby="prize-list-description"
      :tabindex="disabled ? -1 : 0"
      @click="handleClick"
      @keydown="handleKeyDown"
    />

    <!-- Glow effect when spinning -->
    <div
      v-if="isAnimating"
      class="fortune-wheel-glow"
    />
  </div>
</template>

<style scoped>
.fortune-wheel-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fortune-wheel-pointer {
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%) translateX(5px);
  z-index: 10;
  animation: pointerBounce 0.5s ease-in-out infinite;
  animation-play-state: paused;
}

.fortune-wheel-wrapper:hover .fortune-wheel-pointer {
  animation-play-state: running;
}

@keyframes pointerBounce {
  0%, 100% { transform: translateY(-50%) translateX(5px); }
  50% { transform: translateY(-50%) translateX(0px); }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.fortune-wheel-canvas {
  border-radius: 50%;
  cursor: pointer;
  transition: filter 0.3s ease, outline 0.2s ease;
}

.fortune-wheel-canvas:focus {
  outline: 3px solid #FFD700;
  outline-offset: 5px;
}

.fortune-wheel-canvas:focus:not(:focus-visible) {
  outline: none;
}

.fortune-wheel-canvas:hover:not(.fortune-wheel-canvas--disabled) {
  filter: brightness(1.05);
}

.fortune-wheel-canvas--disabled {
  cursor: not-allowed;
  filter: grayscale(30%) brightness(0.8);
}

.fortune-wheel-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  pointer-events: none;
  animation: glowPulse 0.5s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}
</style>
