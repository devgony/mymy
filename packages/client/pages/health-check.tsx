import {
  gql,
  useLazyQuery,
  useMutation,
  useQuery,
  useReactiveVar,
} from '@apollo/client';
import { NextPage } from 'next';
import { Fragment, useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  CreateDbMutationVariables,
  FindDbsQuery,
  CreateDbMutation,
  DeleteDbMutation,
  TestDbQuery,
  CreateDbInput,
} from '../generated/graphql';
import { ImConnection } from 'react-icons/im';
import {
  MdOutlineSignalWifiConnectedNoInternet4,
  MdSignalWifiConnectedNoInternet0,
} from 'react-icons/md';
import { useRouter } from 'next/router';
import { targetDbVar } from '../apollo-client';
import { TARGET_DB, TITLE } from '../utils/const';
import { Helmet } from 'react-helmet';

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

const CREATE_DB = gql`
  mutation createDb($input: CreateDbInput!) {
    createDb(input: $input) {
      ok
      error
    }
  }
`;

const DELETE_DB = gql`
  mutation deleteDb($input: DeleteDbInput!) {
    deleteDb(input: $input) {
      ok
      error
    }
  }
`;

const HealthCheck: NextPage = () => {
  const [numDown, SetNumDown] = useState(0);
  const targetDb = useReactiveVar(targetDbVar);
  const router = useRouter();
  const [ago, setAgo] = useState(0);
  // const localDelayStr = localStorage.getItem('delay');
  // const localDelay = localDelayStr ? +localDelayStr : 30;
  // const [delay, setDelay] = useState(localDelay);

  const { register, getValues, setValue, handleSubmit, formState, watch } =
    useForm<any>({
      mode: 'onChange',
    });

  const onCompletedCreateDb = (data: CreateDbMutation) => {
    const { ok, error } = data.createDb;
    if (!ok) {
      alert(error);
      return;
    }
    refetch();
    setAdding(false);
  };
  const [createDb, { data: dataCreateDb }] = useMutation<
    CreateDbMutation,
    CreateDbMutationVariables
  >(CREATE_DB, { onCompleted: onCompletedCreateDb });

  const onCompletedDeleteDb = (data: DeleteDbMutation) => {
    const { ok, error } = data.deleteDb;
    if (!ok) {
      alert(error);
      return;
    }
    refetch();
  };
  const [deleteDb, { data: dataDeleteDb }] = useMutation(DELETE_DB, {
    onCompleted: onCompletedDeleteDb,
  });

  const [testDb, { data: dataTestDb }] = useLazyQuery(TEST_DB, {
    fetchPolicy: 'no-cache',
  });

  const { data, error, refetch } = useQuery<FindDbsQuery>(FIND_DBS);
  const [adding, setAdding] = useState(false);
  const [testRequired, setTestRequired] = useState(true);
  const runTest = async () => {
    const [name, host, port, schema, username, password] = getValues([
      `name`,
      `host`,
      `port`,
      `schema`,
      `username`,
      `password`,
    ]);

    const tested = await testDb({
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

    if (!tested?.data?.testDb.ok) {
      alert('Connection error');
      return;
    }
    alert('Connection works!');
    setTestRequired(false);
  };
  const runDeleteDb = (name: string) => {
    const ok = window.confirm(`Delete ${name}?`);
    if (ok) {
      deleteDb({ variables: { input: { name } } });
    }
  };

  const onSubmit: SubmitHandler<CreateDbInput> = ({
    name,
    host,
    port,
    schema,
    username,
    password,
    ...others
  }) => {
    createDb({
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
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAgo(cur => ++cur);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    runChecks();

    const interval = setInterval(() => {
      SetNumDown(0);
      runChecks();
    }, 30000);

    return () => clearInterval(interval);
  }, [data?.findDbs.dbs]);

  const runChecks = async () => {
    const indexes = data?.findDbs.dbs.map((_, i) => i);
    if (indexes) {
      for await (let index of indexes) {
        await runCheck(index, false);
      }
    }
  };

  const runCheck = async (i: number, manual: boolean) => {
    const [name, host, port, schema, username, password] = getValues([
      `name${i}`,
      `host${i}`,
      `port${i}`,
      `schema${i}`,
      `username${i}`,
      `password${i}`,
    ]);

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
      if (manual) {
        alert('Connection error');
      } else {
        SetNumDown(cur => ++cur);
        setAgo(0);
      }
      setValue(`status${i}`, false);
      return;
    }
    if (manual) {
      alert('Connection works!');
    } else {
      setAgo(0);
    }
    setValue(`status${i}`, true);
  };

  const goToRealTime = () => {
    if (!targetDb) {
      alert('Choose target DB first');
      return;
    }
    router.push({
      pathname: '/real-time',
    });
  };

  const getChecked = (dbName: string) => {
    return dbName == targetDb;
  };

  // const inputRef = useRef<HTMLInputElement>(null);

  // const handleDelay = () => {
  //   console.log(inputRef.current?.value);
  //   if (inputRef.current) {
  //     setDelay(+inputRef.current.value);
  //     localStorage.setItem('delay', inputRef.current.value);
  //   }
  // };

  return (
    <div>
      <Helmet>
        <title>{`HealthCheck | ${TITLE}`}</title>
      </Helmet>
      <h1 className="mt-4 text-xl text-center font-bold mb-2">HealthCheck</h1>
      <div className="flex">
        {/* <label className="ml-2 text-lg" htmlFor="delay"> */}
        {/*   delay: */}
        {/* </label> */}
        {/* <input */}
        {/*   key="delay" */}
        {/*   className="bg-gray-300 w-24" */}
        {/*   type="number" */}
        {/*   value={delay} */}
        {/*   ref={inputRef} */}
        {/*   onChange={handleDelay} */}
        {/* /> */}
        <div className="flex mb-2 w-full justify-center">
          <div className="text-lg flex">
            <div className="bg-gray-400 px-2 text-gray-50">Total: </div>
            <div className="mx-2">{data?.findDbs.dbs.length}</div>
          </div>
          <div className="text-lg flex ml-2">
            <div className="bg-green-600 px-2 text-gray-50">Up: </div>
            <div className="mx-2">
              {data ? data?.findDbs.dbs.length - numDown : 0}
            </div>
          </div>
          <div className="text-lg flex ml-2">
            <div className="bg-red-400 px-2 text-gray-50">Down: </div>
            <div className="mx-2">{numDown}</div>
          </div>
        </div>
      </div>
      <h2 className="text-sm">Checked {ago} sec ago</h2>
      <div className="flex flex-col h-96 items-center text-sm">
        {/* <div className="w-full h-8 bg-violet-100 flex items-center"></div> */}
        <div className="w-full pl-2 pt-2 pb-2 grid text-center gap-0.5 grid-cols-[60px,20px,13%,15%,13%,13%,13%,10%,60px,60px] bg-violet-100 justify-center">
          <span>STATUS</span>
          <span />
          <span>NAME</span>
          <span>HOST</span>
          <span>PORT</span>
          <span>SCHEMA</span>
          <span>USER</span>
          <span>PASSWORD</span>
          <span></span>
          <span></span>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-4 w-full pl-2 pb-2 grid gap-0.5 bg-gray-100 justify-center shadow-xl text-center grid-cols-[60px,20px,13%,15%,13%,13%,13%,10%,60px,60px]"
        >
          {data?.findDbs.dbs.map((db, i) => (
            <Fragment key={i}>
              <div
                className="flex justify-center items-center "
                {...register(`status${i}`)}
              >
                {watch(`status${i}`) ? (
                  <ImConnection size={30} color="green" />
                ) : (
                  <MdOutlineSignalWifiConnectedNoInternet4
                    size={30}
                    color="red"
                  />
                )}
              </div>
              <div className="flex justify-center items-center">
                <input
                  type="radio"
                  name="chosen-db"
                  defaultChecked={getChecked(db.name)}
                  onClick={() => {
                    targetDbVar(db.name);
                    localStorage.setItem(TARGET_DB, db.name);
                  }}
                />
              </div>
              <input
                {...register(`name${i}`)}
                value={db.name}
                readOnly={true}
              />
              <input
                {...register(`host${i}`)}
                value={db.host}
                readOnly={true}
              />
              <input
                {...register(`port${i}`)}
                value={db.port}
                readOnly={true}
              />
              <input
                {...register(`schema${i}`)}
                value={db.schema}
                readOnly={true}
              />
              <input
                {...register(`username${i}`)}
                value={db.username}
                readOnly={true}
              />
              <input
                {...register(`password${i}`)}
                type="password"
                value={db.password}
                readOnly={true}
              />
              <button
                type="button"
                className="btn"
                onClick={() => runDeleteDb(db.name)}
              >
                Delete
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => runCheck(i, true)}
              >
                Test
              </button>
            </Fragment>
          ))}
          {adding ? (
            <>
              <span />
              <span />
              <input {...register('name', { required: true })} />
              <input {...register('host', { required: true })} />
              <input {...register('port', { required: true })} />
              <input {...register('schema', { required: true })} />
              <input {...register('username', { required: true })} />
              <input
                {...register('password', { required: true })}
                type="password"
              />
              <button className="btn" onClick={runTest} type="button">
                Test
              </button>
              <button
                // todo - handle lazy tailwind
                className={`px-2 py-0.5 text-white rounded text-xs ${
                  testRequired ? 'bg-gray-400' : 'bg-violet-400'
                }`}
                disabled={testRequired}
                type="submit"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <button className="btn" onClick={() => setAdding(true)}>
                Add
              </button>
            </>
          )}
        </form>
        <button className="btn" onClick={goToRealTime}>
          Go to Realtime
        </button>
      </div>
    </div>
  );
};
export default HealthCheck;
