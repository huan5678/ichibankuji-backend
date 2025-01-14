import { Hono } from 'hono'
import { DrawSetController } from '@/controllers/drawSet.controller'
import { validate } from '@/middlewares/validate'
import { createDrawSetSchema } from '@/schemas/drawSet.schema'

const DrawSetRoute = new Hono()
const controller = new DrawSetController()

DrawSetRoute.get('/', (c) => controller.getAll(c))
DrawSetRoute.get('/:id', (c) => controller.getById(c))
DrawSetRoute.post('/', validate(createDrawSetSchema), (c) => controller.create(c))
DrawSetRoute.put('/:id', validate(createDrawSetSchema), (c) => controller.update(c))
DrawSetRoute.delete('/:id', (c) => controller.delete(c))

export default DrawSetRoute