import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { OwnersController } from './owners.controller';
import { ListingsController } from './listings.controller';
import { RequestersController } from './requesters.controller';
import { BookingRequestsController } from './booking-requests.controller';

@Module({
  controllers: [
    OwnersController,
    ListingsController,
    RequestersController,
    BookingRequestsController,
  ],
  providers: [PrismaService],
})
export class AppModule {}
