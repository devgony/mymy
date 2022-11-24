import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { MONITOR_INTERVAL, PUB_SUB } from 'src/common/common.constants';
import { errLog } from 'src/common/hooks/errLog';
import { getErrorMessage } from 'src/common/hooks/getErrorMessage';
import { createConnection, getConnectionManager, Repository } from 'typeorm';
import { CreateDbInput, CreateDbOutput } from './dtos/create-db.dto';
import { DeleteDbInput, DeleteDbOutput } from './dtos/delete-db.dto';
import { FindDbsOutput } from './dtos/find-dbs.dto';
import { FindDbStatsOutput } from './dtos/find-dbStats.dto';
import { MonitorPerfInput } from './dtos/monitor-perf.dto';
// import { HealthcheckInput, HealthcheckOutput } from './dtos/healthcheck.dto';
import { TestDbInput, TestDbOutput } from './dtos/test-db.dto';
import { Db } from './entities/dbs.entity';

@Injectable()
export class DbsService {
  constructor(
    @InjectRepository(Db)
    private readonly dbs: Repository<Db>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) { }

  async createDB({
    name,
    host,
    port,
    schema,
    username,
    password,
  }: CreateDbInput): Promise<CreateDbOutput> {
    try {
      const dbExists = await this.dbs.findOne({
        where: { host, port, schema },
      });
      if (dbExists) {
        return { ok: false, error: ' DB already exists.' };
      }
      const nameExists = await this.dbs.findOne({
        where: { name },
      });
      if (nameExists) {
        return {
          ok: false,
          error: 'The name already exists',
        };
      }
      await this.dbs.save(
        this.dbs.create({
          name,
          host,
          port,
          schema,
          username,
          password,
        }),
      );
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not create DB' };
    }
  }

  async findDbs(): Promise<FindDbsOutput> {
    try {
      const dbs = await this.dbs.find();
      return { dbs };
    } catch (error) {
      errLog(__filename, error);
    }
  }

  async testDb({
    name,
    host,
    port,
    schema,
    username,
    password,
  }: TestDbInput): Promise<TestDbOutput> {
    try {
      const connection = await createConnection({
        type: 'mysql',
        name,
        host,
        port,
        username,
        password,
        database: schema,
        connectTimeout: 500,
      });
      if (!connection.isConnected) {
        return { ok: false, error: 'Connection failed' };
      }
      connection.close();
      // await this.getPool({ host, port, database, username, password });
      return { ok: true };
    } catch (error) {
      errLog(__filename, error);
      return { ok: false, error: getErrorMessage(error) };
    }
  }

  async deleteDb({ name }: DeleteDbInput): Promise<DeleteDbOutput> {
    try {
      const db = await this.dbs.findOne({ where: { name } });
      if (!db) {
        return { ok: false, error: 'The Db does not exists' };
      }
      this.dbs.delete(db.id);
      return { ok: true };
    } catch (error) {
      errLog(__filename, error);
      return { ok: false, error: 'Could not delete DB' };
    }
  }

  async findDbStats(): Promise<FindDbStatsOutput> {
    try {
      const dbs = await this.dbs.find();
      if (!dbs) {
        return { ok: false, error: 'db does not exist' };
      }
      const dbStats = await Promise.all(
        dbs.map(async db => {
          const stat = await this.testDb(db);
          return { ...db, stat: stat.ok ? 'Y' : 'N' };
        }),
      );
      return { ok: true, dbStats };
    } catch (error) {
      errLog(__filename, error);
      return { ok: false, error: 'Could not find db stats' };
    }
  }

  // async healthcheck({ id }: HealthcheckInput): Promise<HealthcheckOutput> {
  //   try {
  //     const db = await this.dbs.findOne({ where: { id } })
  //     if (!db) {
  //       return { ok: false, error: 'Cannot find db' }
  //     }
  //     const { host, port, schema, username, password } = db;

  //     return { ok: true, id }
  //   } catch (error) {
  //     errLog(__filename, error);
  //     return { ok: false, error: 'Could not check health' };
  //   }
  // }

  async startMonitor(
    subscriptionName: string,
    { name }: MonitorPerfInput,
    query: string,
  ) {
    const connection = await this.openConnection({ name });
    const interval = setInterval(async () => {
      const result = await connection.query(query);
      let data;
      if (subscriptionName === 'monitorPerf') {
        const currentTime = new Date().toString().split(' ')[4];
        data = { currentTime, ...result[0] };
      } else {
        data = { sessions: result };
      }
      this.pubSub.publish(subscriptionName, {
        [subscriptionName]: data,
      });
    }, MONITOR_INTERVAL);
    return { interval, connection };
  }

  async openConnection({ name }: MonitorPerfInput) {
    try {
      const { host, port, schema, username, password } = await this.dbs.findOne(
        { where: { name } },
      );
      if (!host) {
        new Error('Could not find link');
      }
      // do sth
      const connectionManager = getConnectionManager();

      const connName = `realtime-${name}`;
      if (connectionManager.has(connName)) {
        const connection = connectionManager.get(connName);
        console.log('reuse');
        return Promise.resolve(
          connection.isConnected ? connection : connection.connect(),
        );
      }
      const connection = await createConnection({
        type: 'mysql',
        name: connName,
        host,
        port,
        username,
        password,
        database: schema,
        connectTimeout: 500,
      });

      console.log('newConnection');
      return connection;
    } catch (error) {
      errLog(__filename, error);
    }
  }
}
