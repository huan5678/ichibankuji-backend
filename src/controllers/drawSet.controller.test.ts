import { Context } from 'hono'
import { DrawSetController } from './drawSet.controller'
import { DrawSetService } from '@/services/drawSet.service'
import { DrawSetPrizeService } from '@/services/drawSetPrize.service'
import { PrizeService } from '@/services/prize.service'

// Mock services
const drawSetService = new DrawSetService()
const drawSetPrizeService = new DrawSetPrizeService()
const prizeService = new PrizeService()

const drawSetController = new DrawSetController(drawSetService, drawSetPrizeService, prizeService)

describe('DrawSetController', () => {
  let ctx: Context

  beforeEach(() => {
    ctx = {
      req: {
        json: jest.fn(),
        param: jest.fn()
      }
    } as unknown as Context
  })

  it('should get all draw sets', async () => {
    jest.spyOn(drawSetService, 'findAll').mockResolvedValue([])
    const response = await drawSetController.getAll(ctx)
    expect(response).toBeDefined()
    expect(drawSetService.findAll).toHaveBeenCalled()
  })

  it('should create a draw set', async () => {
    const drawSetData = {id: '1', name: 'Test', description: 'Test', image: '', enabled:true,  price: 100, maxDraws: 10, startTime: new Date(), endTime: new Date(), createdAt: new Date(), updatedAt: new Date()}
    jest.spyOn(ctx.req, 'json').mockResolvedValue(drawSetData)
    jest.spyOn(drawSetService, 'create').mockResolvedValue(drawSetData)
    const response = await drawSetController.create(ctx)
    expect(response).toBeDefined()
    expect(drawSetService.create).toHaveBeenCalledWith(expect.objectContaining(drawSetData))
  })

  it('should get a draw set by id', async () => {
    const drawSetId = '1'
    jest.spyOn(ctx.req, 'param').mockReturnValue({ id: drawSetId })
    jest.spyOn(drawSetService, 'findById').mockResolvedValue({
      id: '1',
      name: 'SampleSet',
      description: null,
      image: null,
      startTime: new Date(),
      endTime: new Date(),
      enabled: true,
      maxDraws: 10,
      price: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    const response = await drawSetController.getById(ctx)
    expect(response).toBeDefined()
    expect(drawSetService.findById).toHaveBeenCalledWith(drawSetId)
  })

  it('should update a draw set', async () => {
    const drawSetId = '1'
    const drawSetData = { id: '1' , name: 'Updated', description: 'Updated', image: '', enabled: true, price: 200, maxDraws: 20, startTime: new Date(), endTime: new Date(), createdAt: new Date(), updatedAt: new Date() }
    jest.spyOn(ctx.req, 'param').mockReturnValue({ id: drawSetId })
    jest.spyOn(ctx.req, 'json').mockResolvedValue(drawSetData)
    jest.spyOn(drawSetService, 'update').mockResolvedValue(drawSetData)
    const response = await drawSetController.update(ctx)
    expect(response).toBeDefined()
    expect(drawSetService.update).toHaveBeenCalledWith(drawSetId, expect.objectContaining(drawSetData))
  })

  it('should delete a draw set', async () => {
    const drawSetId = '1'
    jest.spyOn(ctx.req, 'param').mockReturnValue({ id: drawSetId })
    jest.spyOn(drawSetService, 'findById').mockResolvedValue({
      id: '1',
      name: 'SampleSet',
      description: null,
      image: null,
      startTime: new Date(),
      endTime: new Date(),
      enabled: true,
      maxDraws: 10,
      price: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    jest.spyOn(drawSetPrizeService, 'deleteByDrawSetId').mockResolvedValue(Promise.resolve())
    jest.spyOn(drawSetService, 'delete').mockResolvedValue(undefined)
    const response = await drawSetController.delete(ctx)
    expect(response).toBeDefined()
    expect(drawSetService.findById).toHaveBeenCalledWith(drawSetId)
    expect(drawSetPrizeService.deleteByDrawSetId).toHaveBeenCalledWith(drawSetId)
    expect(drawSetService.delete).toHaveBeenCalledWith(drawSetId)
  })

  it('should get prizes by draw set id', async () => {
    const drawSetId = '1'
    jest.spyOn(ctx.req, 'param').mockReturnValue({ id: drawSetId })
    jest.spyOn(drawSetPrizeService, 'findByDrawSetId').mockResolvedValue([])
    const response = await drawSetController.getPrizesByDrawSetId(ctx)
    expect(response).toBeDefined()
    expect(drawSetPrizeService.findByDrawSetId).toHaveBeenCalledWith(drawSetId)
  })
})
