import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DbsService } from './dbs.service';
import { CreateDbInput, CreateDbOutput } from './dtos/create-db.dto';
import { DeleteDbInput, DeleteDbOutput } from './dtos/delete-db.dto';
import { FindDbsOutput } from './dtos/find-dbs.dto';
import { FindDbStatsOutput } from './dtos/find-dbStats.dto';
// import { HealthcheckInput, HealthcheckOutput } from './dtos/healthcheck.dto';
import { TestDbInput, TestDbOutput } from './dtos/test-db.dto';

@Resolver()
export class DbsResolver {
  constructor(private readonly dbsService: DbsService) { }

  @Mutation(() => CreateDbOutput)
  async createDB(
    @Args('input') createDbInput: CreateDbInput,
  ): Promise<CreateDbOutput> {
    return this.dbsService.createDB(createDbInput);
  }

  @Mutation(() => DeleteDbOutput)
  async deleteDb(
    @Args('input') deletedbInput: DeleteDbInput,
  ): Promise<DeleteDbOutput> {
    return this.dbsService.deleteDb(deletedbInput);
  }

  @Query(() => FindDbsOutput)
  async findDbs(): Promise<FindDbsOutput> {
    return this.dbsService.findDbs();
  }

  @Query(() => TestDbOutput)
  async testDb(@Args('input') testdbInput: TestDbInput): Promise<TestDbOutput> {
    return this.dbsService.testDb(testdbInput);
  }

  @Query(() => FindDbStatsOutput)
  async findDbStats(): Promise<FindDbStatsOutput> {
    return this.dbsService.findDbStats();
  }

  // @Query(() => HealthcheckOutput)
  // async healthcheck(@Args('input') healthcheckInput: HealthcheckInput): Promise<HealthcheckOutput> {
  //   return this.dbsService.healthcheck(healthcheckInput);
  // }
}
