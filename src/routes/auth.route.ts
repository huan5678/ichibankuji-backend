import { Hono } from 'hono'
import { AuthController } from '@/controllers/auth.controller'
import { validate } from '@/middlewares/validate'
import { 
  adminUserUpdateSchema, 
  forgotPasswordSchema, 
  loginSchema, 
  registerSchema, 
  resetPasswordSchema,
  updateProfileSchema 
} from '@/schemas/auth.schema'
import { adminAuth, userAuth } from '@/middlewares/adminAuth'

const AuthRoute = new Hono()
const controller = new AuthController()

// 公開路由
AuthRoute.post('/register', validate(registerSchema), (c) => controller.register(c))
AuthRoute.post('/login', validate(loginSchema), (c) => controller.login(c))
AuthRoute.get('/verify', (c) => controller.verify(c))
AuthRoute.post('/forgot-password', validate(forgotPasswordSchema), (c) => controller.forgotPassword(c))
AuthRoute.post('/reset-password', validate(resetPasswordSchema), (c) => controller.resetPassword(c))

// 需要登入的路由
AuthRoute.put('/profile', userAuth(), validate(updateProfileSchema), (c) => controller.updateProfile(c))

// 需要管理員權限的路由
AuthRoute.get('/users', adminAuth(), (c) => controller.getAllUsers(c))
AuthRoute.get('/users/:id', adminAuth(), (c) => controller.getUserById(c))
AuthRoute.put('/users/:id', adminAuth(), validate(adminUserUpdateSchema), (c) => controller.updateUserAsAdmin(c))

export default AuthRoute