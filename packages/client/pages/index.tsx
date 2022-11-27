import { gql, useLazyQuery, useQuery, useReactiveVar } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { targetDbVar } from '../apollo-client';
import { FindDbsQuery } from '../generated/graphql';
import { TITLE } from '../utils/const';

const FIND_DBS = gql`
  query findDbs {
    findDbs {
      dbs {
        name
        host
        port
        schema
        username
        password
      }
    }
  }
`;

const TEST_DB = gql`
  query testDb($input: TestDbInput!) {
    testDb(input: $input) {
      ok
      error
    }
  }
`;

const Home: NextPage = () => {
  const targetDb = useReactiveVar(targetDbVar);
  const router = useRouter();
  const [numBad, setNumBad] = useState(0);

  const { data, error, refetch } = useQuery<FindDbsQuery>(FIND_DBS);
  const [testDb, { data: dataTestDb }] = useLazyQuery(TEST_DB, {
    fetchPolicy: 'no-cache',
  });

  const numDb = data?.findDbs.dbs.length;
  const numGood = numDb ? numDb - numBad : 0;

  const runChecks = async () => {
    if (data) {
      for await (let db of data.findDbs.dbs) {
        await runCheck(db, false);
      }
    }
  };

  const runCheck = async (db: any, manual: boolean) => {
    const { name, host, port, schema, username, password } = db;

    const testDbResult = await testDb({
      variables: {
        input: {
          name,
          host,
          port: +port,
          schema,
          username,
          password,
        },
      },
    });

    if (!testDbResult?.data?.testDb.ok) {
      setNumBad(cur => ++cur);
    }
  };

  useEffect(() => {
    runChecks();
  }, [data?.findDbs.dbs]);

  const goToRealTime = () => {
    if (!targetDb) {
      alert('Choose target DB first');
      router.push({ pathname: '/health-check' });
      return;
    }
    router.push({ pathname: '/real-time' });
  };

  return (
    <div className="flex w-full mt-24 justify-center text-center">
      <Helmet>
        <title>{`Home | ${TITLE}`}</title>
      </Helmet>
      <section
        className="w-1/3 h-24 mr-16 hover:cursor-pointer hover:shadow-2xl"
        onClick={() => router.push({ pathname: 'health-check' })}
      >
        <div className="bg-violet-400 w-full rounded-t-lg text-gray-100">
          HealthCheck
        </div>
        <div className="bg-gray-200 h-full rounded-b-lg flex flex-col justify-center shadow-2xl">
          <p>Total DB: {numDb}</p>
          <p>Good: {numGood}</p>
          <p>Bad: {numBad}</p>
        </div>
      </section>
      <section
        className="w-1/3 h-24 hover:cursor-pointer hover:shadow-2xl"
        onClick={goToRealTime}
      >
        <div className="bg-violet-400 w-full rounded-t-lg text-gray-100">
          RealTime
        </div>
        <div className="bg-gray-200 h-full rounded-b-lg flex flex-col justify-center shadow-2xl">
          <p>CurrentDB: {targetDb}</p>
        </div>
      </section>
    </div>
  );
};
export default Home;
