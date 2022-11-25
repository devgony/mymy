import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbsService } from './dbs.service';
import { Db } from './entities/dbs.entity';
import { DbsResolver } from './dbs.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Db])],
  providers: [DbsResolver, DbsService],
  exports: [DbsService],
})
export class DbsModule { }
