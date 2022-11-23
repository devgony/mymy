import { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div className="flex w-full mt-24 justify-around text-center">
      <section className="w-1/3 h-24">
        <div className="bg-violet-400 w-full rounded-t-lg text-gray-100">
          HealthCheck
        </div>
        <div className="bg-gray-200 h-full rounded-b-lg flex flex-col justify-center shadow-2xl">
          <p>Good: 10</p>
          <p>Bad: 1</p>
        </div>
      </section>
      <section className="w-1/3 h-24">
        <div className="bg-violet-400 w-full rounded-t-lg text-gray-100">
          RealTime
        </div>
        <div className="bg-gray-200 h-full rounded-b-lg flex flex-col justify-center shadow-2xl">
          <p>current: chooseDB</p>
        </div>
      </section>
    </div>
  );
};
export default Home;
