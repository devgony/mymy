import { InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { ResultOutput } from 'src/common/dtos/result.dto';
import { Db } from '../entities/dbs.entity';

@InputType()
export class TestDbInput extends OmitType(Db, [
  'id',
  'created_at',
  'updated_at',
]) { }

@ObjectType()
export class TestDbOutput extends ResultOutput { }
