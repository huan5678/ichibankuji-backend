
import { Hono } from 'hono'
import AuthRoute from './auth.route'
import DrawSetRoute from './drawSet.route'
import DrawRoute from './draw.route'
import PrizeRoute from './prize.route'
import DrawSetPrizeRoute from './drawSetPrize.route'

const router = new Hono()

router.route('/api/auth', AuthRoute)
router.route('/api/draw-sets', DrawSetRoute)
router.route('/api/prizes', PrizeRoute)
router.route('/api/draws', DrawRoute)
router.route('/api/draw-set-prizes', DrawSetPrizeRoute)

export default router