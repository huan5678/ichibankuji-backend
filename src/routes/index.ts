
import { Hono } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'
import AuthRoute from './auth.route'
import DrawSetRoute from './drawSet.route'
import DrawRoute from './draw.route'
import PrizeRoute from './prize.route'
import DrawSetPrizeRoute from './drawSetPrize.route'

const router = new Hono()

// 設置 Swagger UI
router.get(
  '/docs',
  swaggerUI({
    url: '/api/docs.json'
  })
)

// 設置 OpenAPI 文件
router.get('/docs.json', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Ichiban Kuji API',
      version: '1.0.0',
      description: '一番賞抽獎系統 API 文件'
    },
    paths: {
      '/api/auth/register': {
        post: {
          summary: '用戶註冊',
          tags: ['認證'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    name: { type: 'string', minLength: 2 }
                  },
                  required: ['email', 'password', 'name']
                }
              }
            }
          },
          responses: {
            '200': {
              description: '註冊成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          token: { type: 'string' },
                          user: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              email: { type: 'string' },
                              name: { type: 'string' },
                              role: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      // 其他路由的 OpenAPI 定義可以在這裡添加...
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  })
})

// 註冊路由
router.route('/auth', AuthRoute)
router.route('/draw-sets', DrawSetRoute)
router.route('/prizes', PrizeRoute)
router.route('/draws', DrawRoute)
router.route('/draw-set-prizes', DrawSetPrizeRoute)

export default router