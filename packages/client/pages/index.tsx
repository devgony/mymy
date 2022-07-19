import { gql, useQuery, useReactiveVar } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { isLoggedInVar } from '../apollo-client';
import { FindDbStatsQuery } from '../generated/graphql';

const FIND_DB_STATS = gql`
  query findDbStats {
    findDbStats {
      dbStats {
        name
        host
        port
        schema
        username
        password
        stat
      }
    }
  }
`;

const Home: NextPage = () => {
  const { data, loading } = useQuery<FindDbStatsQuery>(FIND_DB_STATS);
  // const [stat, setStat] = useState("Y");
  // const { data: dataCheck, refetch } = useQuery<>();
  return (
    <div className="flex h-full justify-center items-center">
      <div className="bg-gray-300 h-1/2 w-2/3">
        Connection List
        <div className="grid grid-cols-7 text-center">
          {['NAME', 'HOST', 'PORT', 'SCHEMA', 'USERNAME', 'PASSWORD', 'STAT'].map(
            (v, i) => (
              <span key={i}>{v}</span>
            ),
          )}
          {data?.findDbStats.dbStats?.map((db, i) =>
            Object.entries(db).map(([k, v], j) => {
              return k === '__typename' ? null : (
                <span key={`${i}${j}`}>{v}</span>
              );
            })
          )
          }
        </div>
      </div>
    </div>
  );
};
export default Home;
