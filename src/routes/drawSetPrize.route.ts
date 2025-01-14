import { Hono } from 'hono'
import { DrawSetPrizeController } from '@/controllers/drawSetPrize.controller'

const router = new Hono()
const controller = new DrawSetPrizeController()

router.post('/', (c) => controller.addPrize(c))
router.put('/:drawSetId/:prizeId/rarity', (c) => controller.updateRarity(c))
router.delete('/:drawSetId/:prizeId', (c) => controller.removePrize(c))

export default router