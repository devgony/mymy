import { Field, ObjectType } from '@nestjs/graphql';
import { ResultOutput } from 'src/common/dtos/result.dto';
import { Db } from '../entities/dbs.entity';

@ObjectType()
class DbStat extends Db {
  @Field(() => String)
  stat: string;
}

@ObjectType()
export class FindDbStatsOutput extends ResultOutput {
  @Field(() => [DbStat], { nullable: true })
  dbStats?: DbStat[];
}
