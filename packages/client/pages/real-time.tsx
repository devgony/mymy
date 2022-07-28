import {
  VictoryArea,
  VictoryChart,
  VictoryContainer,
} from "victory";
import { gql, useSubscription } from "@apollo/client";
import { NextPage } from "next"
import { useEffect, useState } from "react";
import { MonitorPerfOuput, MonitorPerfSubscription, MonitorPerfSubscriptionVariables } from "../generated/graphql";

const MONITOR_PERF = gql`
  subscription monitorPerf($input: MonitorPerfInput!) {
    monitorPerf(input: $input) {
      Innodb_buffer_pool_reads
      Bytes_sent
      Threads_connected
      Threads_running
      Innodb_row_lock_waits
      Innodb_rows_updated
    }
  }
`;

const HEADERS = [
  "Innodb_buffer_pool_reads"
  , "Bytes_sent"
  , "Threads_connected"
  , "Threads_running"
  , "Innodb_row_lock_waits"
  , "Innodb_rows_updated"
]

type IChartData = {
  [key in keyof Omit<MonitorPerfOuput, "__typename" | "currentTime">]: [
    { x: string, y: number }
  ]
};

const RealTime: NextPage = () => {
  const initData = Array(5).fill({ x: "00:00:00", y: 0 }) as [
    { x: string; y: number }
  ];
  const [chartData, setChartData] = useState<IChartData>({
    Innodb_buffer_pool_reads: initData,
    Bytes_sent: initData,
    Threads_connected: initData,
    Threads_running: initData,
    Innodb_row_lock_waits: initData,
    Innodb_rows_updated: initData,
  });

  const name = 'mysql1';
  const { data, error, loading } = useSubscription<MonitorPerfSubscription, MonitorPerfSubscriptionVariables>(
    MONITOR_PERF,
    { variables: { input: { name } } }
  );
  useEffect(() => {
    // console.log("workd")
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
            {}
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
  return (
    <div className="h-full">
      {/* <Helmet> */}
      {/*   <title>{`Dashboard | ${TITLE}`}</title> */}
      {/* </Helmet> */}
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
                style={{ data: { fill: "lightblue", stroke: "teal" } }}
              />
            </VictoryChart>
          </div>
        ))}
      </div>
    </div>
  )
}
export default RealTime
