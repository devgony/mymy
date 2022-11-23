import { Inject } from '@nestjs/common';
import { Args, Mutation, Subscription, Query, Resolver } from '@nestjs/graphql';
import {
  MONITOR_PERF,
  MONITOR_SESSIONS,
  PUB_SUB,
} from 'src/common/common.constants';
import { withCancel } from 'src/common/hooks/withCancel';
import { DbsService } from './dbs.service';
import { CreateDbInput, CreateDbOutput } from './dtos/create-db.dto';
import { DeleteDbInput, DeleteDbOutput } from './dtos/delete-db.dto';
import { FindDbsOutput } from './dtos/find-dbs.dto';
import { FindDbStatsOutput } from './dtos/find-dbStats.dto';
import { MonitorPerfInput, MonitorPerfOuput } from './dtos/monitor-perf.dto';
// import { HealthcheckInput, HealthcheckOutput } from './dtos/healthcheck.dto';
import { TestDbInput, TestDbOutput } from './dtos/test-db.dto';
import { PubSub } from 'graphql-subscriptions';
import { sqlPerf, sqlSessions } from 'src/common/sqls';
import {
  MonitorSessionsInput,
  MonitorSessionsOutput,
} from './dtos/monitor-sessions.dto';

@Resolver()
export class DbsResolver {
  constructor(
    private readonly dbsService: DbsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) { }

  @Mutation(() => CreateDbOutput)
  async createDb(
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

  @Subscription(_ => MonitorPerfOuput)
  async monitorPerf(@Args('input') monitorPerfInput: MonitorPerfInput) {
    const { interval, connection } = await this.dbsService.startMonitor(
      MONITOR_PERF,
      monitorPerfInput,
      sqlPerf,
    );
    return withCancel(this.pubSub.asyncIterator(MONITOR_PERF), () => {
      console.log('cleared');
      clearInterval(interval);
      // connection.close();
    });
  }

  @Subscription(_ => MonitorSessionsOutput)
  async monitorSessions(
    @Args('input') monitorSessionsInput: MonitorSessionsInput,
  ) {
    const { interval, connection } = await this.dbsService.startMonitor(
      MONITOR_SESSIONS,
      monitorSessionsInput,
      // process.env.mode === 'prod' ? PROD_activeSessionQ : activeSessionQ,
      sqlSessions,
    );
    return withCancel(this.pubSub.asyncIterator(MONITOR_SESSIONS), () => {
      clearInterval(interval);
      // connection.close();
    });
  }

  // @Query(() => HealthcheckOutput)
  // async healthcheck(@Args('input') healthcheckInput: HealthcheckInput): Promise<HealthcheckOutput> {
  //   return this.dbsService.healthcheck(healthcheckInput);
  // }
}
