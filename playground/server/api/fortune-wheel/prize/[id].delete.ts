// Prize endpoint - DELETE /api/fortune-wheel/prize/:id
import prisma from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing prize ID' })
  }

  // Check if prize exists
  const existing = await prisma.prize.findUnique({
    where: { id },
  })

  if (!existing) {
    throw createError({ statusCode: 404, message: 'Prize not found' })
  }

  await prisma.prize.delete({
    where: { id },
  })

  setResponseStatus(event, 204)
  return null
})
