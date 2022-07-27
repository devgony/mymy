import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Db } from '../entities/dbs.entity';

@InputType()
export class MonitorPerfInput extends PickType(Db, ['name']) { }

@ObjectType()
export class MonitorPerfOuput {
  @Field((_) => String)
  currentTime: string;

  @Field(() => Number)
  Innodb_buffer_pool_reads: number;

  @Field(() => Number)
  Bytes_sent: number;

  @Field(() => Number)
  Threads_connected: number;

  @Field(() => Number)
  Threads_running: number;

  @Field(() => Number)
  Innodb_row_lock_waits: number;

  @Field(() => Number)
  Innodb_rows_updated: number;
}
