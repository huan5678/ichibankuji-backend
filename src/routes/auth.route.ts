import { Hono } from 'hono'
import { AuthController } from '@/controllers/auth.controller'
import { validate } from '@/middlewares/validate'
import { loginSchema, registerSchema } from '@/schemas/auth.schema'

const AuthRoute = new Hono()
const controller = new AuthController()

AuthRoute.post('/register', validate(registerSchema), (c) => controller.register(c))
AuthRoute.post('/login', validate(loginSchema), (c) => controller.login(c))

export default AuthRoute