import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.prisma.article.findMany({
      where: search
        ? {
            OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      include: {
        metrics: {
          orderBy: { createdAt: 'desc' as const },
          take: 1,
          select: {
            avgDailyDemand: true,
            annualRotation: true,
            totalConsumption: true,
            periodWorkingDays: true,
          },
        },
      },
      orderBy: { code: 'asc' },
      take: 200,
    });
  }
}
