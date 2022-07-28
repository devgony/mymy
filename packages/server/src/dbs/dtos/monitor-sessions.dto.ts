import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Column } from 'typeorm';
import { Db } from '../entities/dbs.entity';

@InputType()
export class MonitorSessionsInput extends PickType(Db, ['name']) { }

@ObjectType()
class Session {
  @Field(() => String, { nullable: false })
  // @Column({ type: 'bigint', nullable: false })
  id: string;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'varchar', length: 6, nullable: true })
  holder?: string;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'bigint', nullable: true })
  thread_id?: string;
  @Field(() => String, { nullable: false })
  // @Column({ type: 'varchar', length: 32, nullable: false })
  user: string;
  @Field(() => String, { nullable: false })
  // @Column({ type: 'varchar', length: 261, nullable: false })
  host: string;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'varchar', length: 64, nullable: true })
  db?: string;
  @Field(() => String, { nullable: false })
  // @Column({ type: 'int', nullable: false })
  elapsed_time: string;
  @Field(() => Number, { nullable: true })
  // @Column({ type: 'decimal', precision: 24, scale: 3, nullable: true })
  wait_time?: number;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'bigint', nullable: true })
  event_id?: string;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'varchar', length: 128, nullable: true })
  event_name?: string;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'longtext', nullable: true })
  sqltext?: string;
  @Field(() => String, { nullable: false })
  // @Column({ type: 'varchar', length: 16, nullable: false })
  command: string;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'varchar', length: 64, nullable: true })
  state?: string;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'varchar', length: 64, nullable: true })
  source?: string;
  @Field(() => String, { nullable: false })
  // @Column({ type: 'varchar', length: 10, nullable: false })
  spins: string;
  @Field(() => String, { nullable: false })
  // @Column({ type: 'varchar', length: 64, nullable: false })
  object_schema: string;
  @Field(() => String, { nullable: false })
  // @Column({ type: 'varchar', length: 512, nullable: false })
  object_name: string;
  @Field(() => String, { nullable: false })
  // @Column({ type: 'varchar', length: 64, nullable: false })
  object_type: string;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'bigint', nullable: true })
  object_instance_begin?: string;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'varchar', length: 32, nullable: true })
  operation?: string;
  @Field(() => String, { nullable: false })
  // @Column({ type: 'varchar', length: 20, nullable: false })
  number_of_bytes: string;
  @Field(() => String, { nullable: true })
  // @Column({ type: 'bigint', nullable: true })
  process_id?: string;
}

@ObjectType()
export class MonitorSessionsOutput {
  @Field(() => [Session], { nullable: true })
  sessions?: Session[]
}
