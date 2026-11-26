import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { ChroniclesController } from './chronicles.controller';
import { ChroniclesService } from './chronicles.service';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [ChroniclesController],
  providers: [ChroniclesService],
  exports: [ChroniclesService],
})
export class ChroniclesModule {}
