
import { Hono } from 'hono'
import AuthRoute from './auth.route'
import DrawSetRoute from './drawSet.route'
import DrawRoute from './draw.route'
import PrizeRoute from './prize.route'

const router = new Hono()

router.route('/api/auth', AuthRoute)
router.route('/api/draw-sets', DrawSetRoute)
router.route('/api/prizes', PrizeRoute)
router.route('/api/draws', DrawRoute)

export default router