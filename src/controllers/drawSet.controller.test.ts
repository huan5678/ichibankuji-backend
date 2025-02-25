import { Context } from 'hono'
import { DrawSetController } from './drawSet.controller'
import { DrawSetService } from '@/services/drawSet.service'
import { DrawSetPrizeService } from '@/services/drawSetPrize.service'
import { PrizeService } from '@/services/prize.service'
import { Rarity } from '@prisma/client'

// 模擬 AdminAuth 裝飾器
jest.mock('@/decorators/adminAuth.decorator', () => ({
  AdminAuth: () => (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) => descriptor
}))

describe('DrawSetController', () => {
  let mockDrawSetService: jest.Mocked<DrawSetService>
  let mockDrawSetPrizeService: jest.Mocked<DrawSetPrizeService>
  let mockPrizeService: jest.Mocked<PrizeService>
  let controller: DrawSetController
  let ctx: Partial<Context>

  beforeEach(() => {
    mockDrawSetService = {
      findAll: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any

    mockDrawSetPrizeService = {
      deleteByDrawSetId: jest.fn(),
      findByDrawSetId: jest.fn(),
    } as any

    mockPrizeService = {
      findById: jest.fn(),
    } as any

    controller = new DrawSetController(
      mockDrawSetService,
      mockDrawSetPrizeService,
      mockPrizeService
    )

    ctx = {
      req: {
        json: jest.fn(),
        param: jest.fn((name) => name === 'id' ? '1' : undefined)
      },
      json: jest.fn().mockReturnValue(new Response()),
    } as unknown as Partial<Context>
  })

  const drawSet = {
    id: '1',
    name: 'Test Draw Set',
    description: 'Test Description',
    image: null,
    enabled: true,
    price: 100,
    maxDraws: 10,
    startTime: new Date(),
    endTime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const prize = {
    name: 'Prize 1',
    id: '1',
    description: 'Prize Description 1',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }

  it('should get all draw sets', async () => {
    mockDrawSetService.findAll.mockResolvedValue([])
    
    await controller.getAll(ctx as Context)
    
    expect(mockDrawSetService.findAll).toHaveBeenCalled()
    expect(ctx.json).toHaveBeenCalledWith({
      success: true,
      data: []
    }, 200)
  })

  it('should create a draw set', async () => {
    const requestBody = {
      name: 'Test Draw Set',
      description: 'Test Description',
      price: 100,
      maxDraws: 10,
      startTime: drawSet.startTime.toISOString(),
      endTime: drawSet.endTime.toISOString()
    }

    if (ctx.req) {
      ctx.req.json = jest.fn().mockResolvedValue(requestBody)
    }
    mockDrawSetService.create.mockResolvedValue(drawSet)

    await controller.create(ctx as Context)

    expect(mockDrawSetService.create).toHaveBeenCalledWith({
      name: requestBody.name,
      description: requestBody.description,
      price: requestBody.price,
      maxDraws: requestBody.maxDraws,
      startTime: expect.any(Date),
      endTime: expect.any(Date)
    })

    expect(ctx.json).toHaveBeenCalledWith({
      success: true,
      data: drawSet
    }, 200)
  })

  it('should get a draw set by id', async () => {
    mockDrawSetService.findById.mockResolvedValue(drawSet)

    await controller.getById(ctx as Context)

    expect(mockDrawSetService.findById).toHaveBeenCalledWith('1')
    expect(ctx.json).toHaveBeenCalledWith({
      success: true,
      data: drawSet
    }, 200)
  })

  it('should update a draw set', async () => {
    const drawSetData = {
      id: '1',
      name: 'Updated Draw Set',
      description: 'Updated Description',
      image: null,
      enabled: true,
      price: 200,
      maxDraws: 20,
      startTime: new Date(),
      endTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (ctx.req) {
      ctx.req.json = jest.fn().mockResolvedValue(drawSetData)
    }
    mockDrawSetService.update.mockResolvedValue(drawSetData)

    await controller.update(ctx as Context)

    expect(mockDrawSetService.update).toHaveBeenCalledWith('1', expect.objectContaining({
      name: drawSetData.name,
      description: drawSetData.description,
      price: drawSetData.price,
      maxDraws: drawSetData.maxDraws,
    }))
    
    expect(ctx.json).toHaveBeenCalledWith({
      success: true,
      data: drawSetData
    }, 200)
  })

  it('should delete a draw set', async () => {
    mockDrawSetService.findById.mockResolvedValue(drawSet)
    
    await controller.delete(ctx as Context)

    expect(mockDrawSetService.findById).toHaveBeenCalledWith('1')
    expect(mockDrawSetPrizeService.deleteByDrawSetId).toHaveBeenCalledWith('1')
    expect(mockDrawSetService.delete).toHaveBeenCalledWith('1')
    expect(ctx.json).toHaveBeenCalledWith({
      success: true,
      data: drawSet
    }, 200)
  })

  it('should get prizes by draw set id', async () => {
    const prizes = [{
      id: '1',
      name: 'Prize 1',
      description: 'Prize Description 1',
      image: null,
      number: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      drawSetId: '1',
      prizeId: '1',
      rarity: 'A' as Rarity,
      quantity: 1,
      remaining: 1,
      Prize: prize,
      DrawSet: drawSet
    }]
    
    mockDrawSetPrizeService.findByDrawSetId.mockResolvedValue(prizes)

    await controller.getPrizesByDrawSetId(ctx as Context)

    expect(mockDrawSetPrizeService.findByDrawSetId).toHaveBeenCalledWith('1')
    expect(ctx.json).toHaveBeenCalledWith({
      success: true,
      data: prizes
    }, 200)
  })
})