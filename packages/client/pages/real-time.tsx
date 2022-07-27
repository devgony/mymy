import { gql, useSubscription } from "@apollo/client";
import { NextPage } from "next"
import { useEffect, useState } from "react";
import { MonitorPerfOuput, MonitorPerfSubscription, MonitorPerfSubscriptionVariables } from "../generated/graphql";

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
  console.log(data, error, loading);
  useEffect(() => {
    console.log("workd")
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
      console.log(chartData, error);
    }
  }, [data]);
  return (
    <div>
      <h1>realtime</h1>
      <h1>{JSON.stringify(data)}</h1>
    </div>
  )
}
export default RealTime
