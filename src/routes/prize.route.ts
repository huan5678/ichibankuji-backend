import { Hono } from 'hono'
import { PrizeController } from '@/controllers/prize.controller'
import { validate } from '@/middlewares/validate'
import { createPrizeSchema } from '@/schemas/prize.schema'

const PrizeRoute = new Hono()
const controller = new PrizeController()

PrizeRoute.get('/draw-set/:drawSetId', (c) => controller.getByDrawSet(c))
PrizeRoute.get('/:id', (c) => controller.getById(c))
PrizeRoute.post('/', validate(createPrizeSchema), (c) => controller.create(c))
PrizeRoute.put('/:id', validate(createPrizeSchema), (c) => controller.update(c))
PrizeRoute.delete('/:id', (c) => controller.delete(c))

export default PrizeRoute