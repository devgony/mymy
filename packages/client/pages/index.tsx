import { gql, useQuery } from '@apollo/client';
import { NextPage } from 'next';
import { FindDbsOutput, FindDbsQuery } from '../generated/graphql';

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

const Home: NextPage = () => {
  const { data, loading } = useQuery<FindDbsQuery>(FIND_DBS);
  console.log(data);
  return (
    <div className="flex h-full justify-center items-center">
      <div className="bg-gray-300 h-1/2 w-2/3">
        Connection List
        <div className="grid grid-cols-6 text-center">
          {['NAME', 'HOST', 'PORT', 'SCHEMA', 'USERNAME', 'PASSWORD'].map(
            (v, i) => (
              <span key={i}>{v}</span>
            ),
          )}
          {data?.findDbs.dbs.map((db, i) =>
            Object.entries(db).map(([k, v], j) => {
              return k === '__typename' ? null : (
                <span key={`${i}${j}`}>{v}</span>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};
export default Home;
