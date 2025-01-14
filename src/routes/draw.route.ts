import { Hono } from 'hono'
import { DrawController } from '@/controllers/draw.controller'
import { validate } from '@/middlewares/validate'
import { executeDrawSchema } from '@/schemas/draw.schema'

const DrawRoute = new Hono()
const controller = new DrawController()

DrawRoute.post('/', validate(executeDrawSchema), (c) => controller.execute(c))
DrawRoute.get('/history', (c) => controller.getHistory(c))
DrawRoute.get('/history/:drawSetId', (c) => controller.getDrawSetHistory(c))

export default DrawRoute