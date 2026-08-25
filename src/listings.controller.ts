import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('ownerId') ownerId?: string,
    @Query('status') status?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = {};
    if (ownerId) where.ownerId = +ownerId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' }, include: { owner: true },
      }),
      this.prisma.listing.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.listing.findUnique({
      where: { id: +id },
      include: { owner: true, bookingRequests: true },
    });
  }

  @Post()
  create(@Body() body: any) {
    const { ownerId, title, category, description, location, capacity, dailyRate, currency, status } = body;
    return this.prisma.listing.create({
      data: {
        ownerId: +ownerId,
        title,
        category,
        description,
        location,
        capacity: capacity !== undefined && capacity !== '' ? Number(capacity) : undefined,
        dailyRate: dailyRate !== undefined && dailyRate !== '' ? Number(dailyRate) : undefined,
        currency,
        status,
      },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['title', 'category', 'description', 'location', 'currency', 'status']) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.capacity !== undefined) data.capacity = body.capacity === '' ? null : Number(body.capacity);
    if (body.dailyRate !== undefined) data.dailyRate = body.dailyRate === '' ? null : Number(body.dailyRate);
    return this.prisma.listing.update({ where: { id: +id }, data });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.listing.update({ where: { id: +id }, data: { status: 'inactive' } });
  }
}
