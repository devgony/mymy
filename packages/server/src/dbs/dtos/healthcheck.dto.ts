import { InputType, IntersectionType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { ResultOutput } from 'src/common/dtos/result.dto';
import { Db } from '../entities/dbs.entity';

@InputType()
export class HealthcheckInput extends PickType(Db, [
  'id',
]) { }

@ObjectType()
export class HealthcheckOutput extends IntersectionType(ResultOutput, PartialType(PickType(Db, ['id']))) { }
