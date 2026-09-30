import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './db.service.js';

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
