import { PrismaClient } from '@prisma/client'

export abstract class BaseService {
  protected prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }
}
