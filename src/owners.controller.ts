import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('owners')
export class OwnersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.owner.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      this.prisma.owner.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.owner.findUnique({
      where: { id: +id },
      include: { listings: true },
    });
  }

  @Post()
  create(@Body() body: any) {
    const { name, company, phone, email, notes, status } = body;
    return this.prisma.owner.create({
      data: { name, company, phone, email, notes, status },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const allowed = ['name', 'company', 'phone', 'email', 'notes', 'status'];
    const data: any = {};
    for (const key of allowed) if (body[key] !== undefined) data[key] = body[key];
    return this.prisma.owner.update({ where: { id: +id }, data });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.owner.update({ where: { id: +id }, data: { deletedAt: new Date() } });
  }
}
