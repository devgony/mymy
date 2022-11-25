import { Field, ObjectType, OmitType } from '@nestjs/graphql';
import { Db } from '../entities/dbs.entity';

// @ObjectType()
// class FindDb extends OmitType(Db, ['created_at', 'updated_at']) { }

@ObjectType()
export class FindDbsOutput {
  @Field(() => [Db])
  dbs: Db[];
}
