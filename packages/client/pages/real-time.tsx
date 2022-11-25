import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { VictoryArea, VictoryChart, VictoryContainer } from 'victory';
import { gql, useReactiveVar, useSubscription } from '@apollo/client';
import { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import {
  MonitorPerfOuput,
  MonitorPerfSubscription,
  MonitorPerfSubscriptionVariables,
  MonitorSessionsSubscription,
  MonitorSessionsSubscriptionVariables,
} from '../generated/graphql';
import { AgGridReact } from 'ag-grid-react';
import { useRouter } from 'next/router';
import { targetDbVar } from '../apollo-client';
import { Helmet } from 'react-helmet';
import { TITLE } from '../utils/const';

const MONITOR_PERF = gql`
  subscription monitorPerf($input: MonitorPerfInput!) {
    monitorPerf(input: $input) {
      currentTime
      Innodb_buffer_pool_reads
      Bytes_sent
      Threads_connected
      Threads_running
      Innodb_row_lock_waits
      Innodb_rows_updated
    }
  }
`;

const MONITOR_SESSIONS = gql`
  subscription monitorSessions($input: MonitorSessionsInput!) {
    monitorSessions(input: $input) {
      sessions {
        id
        holder
        thread_id
        user
        host
        db
        elapsed_time
        wait_time
        event_id
        event_name
        sqltext
        command
        state
        source
        spins
        object_schema
        object_name
        object_type
        object_instance_begin
        operation
        number_of_bytes
        process_id
      }
    }
  }
`;

const HEADERS = [
  'id',
  'holder',
  'thread_id',
  'user',
  'host',
  'db',
  'elapsed_time',
  'wait_time',
  'event_id',
  'event_name',
  'sqltext',
  'command',
  'state',
  'source',
  'spins',
  'object_schema',
  'object_name',
  'object_type',
  'object_instance_begin',
  'operation',
  'number_of_bytes',
  'process_id',
];

type IChartData = {
  [key in keyof Omit<MonitorPerfOuput, '__typename' | 'currentTime'>]: [
    { x: string; y: number },
  ];
};

const RealTime: NextPage = () => {
  const targetDb = useReactiveVar(targetDbVar);
  const router = useRouter();
  useEffect(() => {
    if (!targetDb) {
      router.push({
        pathname: '/health-check',
      });
      alert('Choose target DB first');
    }
  }, []);
  const initData = Array(5).fill({ x: '00:00:00', y: 0 }) as [
    { x: string; y: number },
  ];
  const [chartData, setChartData] = useState<IChartData>({
    Innodb_buffer_pool_reads: initData,
    Bytes_sent: initData,
    Threads_connected: initData,
    Threads_running: initData,
    Innodb_row_lock_waits: initData,
    Innodb_rows_updated: initData,
  });

  const { data, error, loading } = useSubscription<
    MonitorPerfSubscription,
    MonitorPerfSubscriptionVariables
  >(MONITOR_PERF, { variables: { input: { name: targetDb } } });

  const { data: dataSessions } = useSubscription<
    MonitorSessionsSubscription,
    MonitorSessionsSubscriptionVariables
  >(MONITOR_SESSIONS, { variables: { input: { name: targetDb } } });

  useEffect(() => {
    if (data) {
      const input = data.monitorPerf;
      setChartData(prev => {
        const newData = Object.entries(prev)
          .map(([k, v]) => {
            if (v.length >= 5) {
              v.shift();
            }
            v.push({
              x: input.currentTime,
              y: input[k as keyof IChartData],
            });
            return { k, v };
          })
          .reduce(
            (acc, { k, v }) => ({ ...acc, [k]: [...v] }),
            {},
          ) as IChartData;
        return newData;
      });
      // console.log(chartData, error);
    }
  }, [data]);
  const getMin = (data: { x: string; y: number }[]) => {
    return data.reduce((acc, cur) => (acc > cur.y ? cur.y : acc), 0);
  };

  const getMax = (data: { x: string; y: number }[]) => {
    const max =
      (data.reduce((acc, cur) => (acc < cur.y ? cur.y : acc), 0) + 1) * 1.5;
    return max < 10 ? 10 : max;
  };

  const headers = HEADERS.map(header => ({ field: header }));
  const [columnDefs, setColumnDefs] = useState(headers);
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      filter: true,
      sortable: true,
      width: 150,
    }),
    [],
  );

  return (
    <div className="h-full flex flex-col items-center">
      <Helmet>
        <title>{`RealTime | ${TITLE}`}</title>
      </Helmet>
      <div className="mt-4 mb-6 text-2xl">{targetDb}</div>
      <div className="bg-gray-500 grid grid-cols-3 gap-0.5 text-xs">
        {Object.entries(chartData).map(([k, v]) => (
          <div key={k} className="bg-red-50 flex flex-col items-center">
            <h2>{k}</h2>
            <VictoryChart
              domain={{ y: [getMin(v), getMax(v)] }}
              height={window.outerWidth > 1024 ? 200 : 320}
              containerComponent={<VictoryContainer title="testdsfdf" />}
            >
              <VictoryArea
                data={v}
                style={{ data: { fill: 'lightblue', stroke: 'teal' } }}
              />
            </VictoryChart>
          </div>
        ))}
      </div>

      <div
        className="mt-2 ag-theme-alpine"
        style={{ height: 600, width: '100%' }}
      >
        <AgGridReact
          // ref={gridRef} // Ref for accessing Grid's API
          rowData={dataSessions?.monitorSessions.sessions} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true} // Optional - set to 'true' to have rows animate when sorted
          // rowSelection='multiple' // Options - allows click selection of rows
          // ref={gridRef}
          // onSelectionChanged={onSelectionChanged}
          // onCellClicked={cellClickedListener} // Optional - registering for Grid Event
        />
      </div>
    </div>
  );
};
export default RealTime;
