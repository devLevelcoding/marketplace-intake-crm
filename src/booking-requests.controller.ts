import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('booking-requests')
export class BookingRequestsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('requesterId') requesterId?: string,
    @Query('listingId') listingId?: string,
    @Query('status') status?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = {};
    if (requesterId) where.requesterId = +requesterId;
    if (listingId) where.listingId = +listingId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.bookingRequest.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' }, include: { requester: true, listing: true },
      }),
      this.prisma.bookingRequest.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.bookingRequest.findUnique({
      where: { id: +id },
      include: { requester: true, listing: { include: { owner: true } } },
    });
  }

  @Post()
  create(@Body() body: any) {
    const { requesterId, listingId, startDate, endDate, amount, currency, status, notes } = body;
    return this.prisma.bookingRequest.create({
      data: {
        requesterId: +requesterId,
        listingId: +listingId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        amount: amount !== undefined && amount !== '' ? Number(amount) : undefined,
        currency,
        status,
        notes,
      },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['status', 'currency', 'notes']) if (body[key] !== undefined) data[key] = body[key];
    if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.amount !== undefined) data.amount = body.amount === '' ? null : Number(body.amount);
    return this.prisma.bookingRequest.update({ where: { id: +id }, data });
  }

  // The two-sided part: booking a request doesn't just flip its own status,
  // it also takes the listing off the market — the whole point of modeling
  // Requester and Listing as separate entities instead of one generic
  // "Client" like every other CRM in this catalog.
  @Post(':id/book')
  async book(@Param('id') id: string) {
    const request = await this.prisma.bookingRequest.update({
      where: { id: +id },
      data: { status: 'booked' },
    });
    await this.prisma.listing.update({
      where: { id: request.listingId },
      data: { status: 'booked' },
    });
    return request;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.bookingRequest.update({ where: { id: +id }, data: { status: 'rejected' } });
  }
}
