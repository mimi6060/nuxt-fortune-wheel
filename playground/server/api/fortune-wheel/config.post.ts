// Config endpoint - POST /api/fortune-wheel/config
import prisma from '../../utils/prisma'
import { getOrCreateActiveConfig } from '../../utils/wheelConfig'
import { updateConfigSchema, validateBody } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validatedData = validateBody(updateConfigSchema, body)

  let config = await getOrCreateActiveConfig()

  config = await prisma.wheelConfig.update({
    where: { id: config.id },
    data: {
      availableSpins: validatedData.availableSpins ?? config.availableSpins,
      spinDuration: validatedData.spinDuration ?? config.spinDuration,
    },
  })

  return {
    availableSpins: config.availableSpins,
    spinDuration: config.spinDuration,
  }
})
