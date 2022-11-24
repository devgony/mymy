import { useReactiveVar } from '@apollo/client';
import { NextPage } from 'next';
import Link from 'next/link';
import { authTokenVar, isLoggedInVar } from '../apollo-client';
import { LOCALSTORAGE_TOKEN } from '../utils/const';
import { GiDolphin } from 'react-icons/gi';
import { RiHandHeartFill } from 'react-icons/ri';

const NavBar: NextPage = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const logout = () => {
    localStorage.removeItem(LOCALSTORAGE_TOKEN);
    authTokenVar(null);
    isLoggedInVar(false);
  };
  return (
    <div className="w-full flex h-12 justify-between items-center bg-violet-400 text-gray-100 font-bold">
      <Link href="/">
        <a className="ml-4 text-xl flex">
          My
          <GiDolphin className="mx-1 mt-1" />
          in My
          <RiHandHeartFill className="ml-1 mt-1" />
        </a>
      </Link>
      <nav className="w-1/2 flex justify-around">
        <Link href="/health-check">
          <a>HEALTH CHECK</a>
        </Link>
        <Link href="/real-time">
          <a>REAL TIME</a>
        </Link>
        {/* <Link href="/admin"> */}
        {/*   <a>ADMIN</a> */}
        {/* </Link> */}
        {isLoggedIn ? (
          <button className="font-bold" onClick={logout}>
            LOGOUT
          </button>
        ) : null}
      </nav>
    </div>
  );
};
export default NavBar;
