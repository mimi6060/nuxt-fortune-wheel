// Config endpoint - GET /api/fortune-wheel/config
import { getOrCreateActiveConfig, serializePrize } from '../../utils/wheelConfig'

export default defineEventHandler(async () => {
  const config = await getOrCreateActiveConfig(true)

  return {
    prizes: config.prizes?.map(serializePrize) || [],
    availableSpins: config.availableSpins,
    spinDuration: config.spinDuration,
  }
})
