import {
  gql,
  useLazyQuery,
  useMutation,
  useQuery,
  useReactiveVar,
} from '@apollo/client';
import { NextPage } from 'next';
import { Fragment, useEffect, useState } from 'react';
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

export const FIND_DBS = gql`
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

export const TEST_DB = gql`
  query testDb($input: TestDbInput!) {
    testDb(input: $input) {
      ok
      error
    }
  }
`;

export const CREATE_DB = gql`
  mutation createDb($input: CreateDbInput!) {
    createDb(input: $input) {
      ok
      error
    }
  }
`;

export const DELETE_DB = gql`
  mutation deleteDb($input: DeleteDbInput!) {
    deleteDb(input: $input) {
      ok
      error
    }
  }
`;

const HealthCheck: NextPage = () => {
  // const targetDb = useReactiveVar<string>(targetDbVar);
  const targetDb = localStorage.getItem('targetDb');
  const router = useRouter();
  const [ago, setAgo] = useState(0);

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

  const [testDb, { data: dataTestDb }] = useLazyQuery(TEST_DB);

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

    const a = await testDb({
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

    if (!a?.data?.testDb.ok) {
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
    setInterval(() => {
      setAgo(cur => ++cur);
    }, 1000);
  }, []);

  useEffect(() => {
    setInterval(() => {
      data?.findDbs.dbs.forEach((_, i) => {
        runCheck(i, false);
      });
    }, 10000);
  }, [data?.findDbs.dbs]);

  const runCheck = async (i: number, alertable: boolean) => {
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
      alertable ? alert('Connection error') : null;
      setValue(`status${i}`, false);
      setAgo(0);
      return;
    }
    alertable ? alert('Connection works!') : null;
    setValue(`status${i}`, true);
    setAgo(0);
  };

  const goToRealTime = () => {
    if (!targetDb) {
      alert('Choose target db first');
      return;
    }
    router.push({
      pathname: '/real-time',
    });
  };

  const getChecked = (dbName: string) => {
    return dbName == targetDb;
  };

  return (
    <div>
      <h1 className="mt-8 text-xl">HealthCheck</h1>
      <h2 className="text-lg">Checked {ago} sec ago</h2>
      <div className="flex flex-col h-96 items-center text-sm">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full py-4 bg-gray-200 grid text-center gap-0.5 grid-cols-[60px,20px,13%,15%,13%,13%,13%,10%,60px,60px] justify-center"
        >
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
          {data?.findDbs.dbs.map((db, i) => (
            <Fragment key={i}>
              <div className="flex justify-center" {...register(`status${i}`)}>
                {watch(`status${i}`) ? (
                  <ImConnection size={30} color="green" />
                ) : (
                  <MdOutlineSignalWifiConnectedNoInternet4
                    size={30}
                    color="red"
                  />
                )}
              </div>
              <input
                type="radio"
                name="chosen-db"
                checked={getChecked(db.name)}
                onClick={() => localStorage.setItem('targetDb', db.name)}
              />
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
                className="px-2 py-0.5 text-white rounded text-xs bg-red-500"
                onClick={() => runDeleteDb(db.name)}
              >
                Delete
              </button>
              <button
                type="button"
                className="px-2 py-0.5 text-white rounded text-xs bg-green-700"
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
                onClick={() => {}}
                // todo - handle lazy tailwind
                className={`px-2 py-0.5 text-white rounded text-xs ${
                  testRequired ? 'bg-gray-400' : 'bg-green-700'
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
