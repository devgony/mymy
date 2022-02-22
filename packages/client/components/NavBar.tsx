import { useReactiveVar } from '@apollo/client';
import { NextPage } from 'next';
import Link from 'next/link';
import { authTokenVar, isLoggedInVar } from '../apollo-client';
import { LOCALSTORAGE_TOKEN } from '../utils/const';

const NavBar: NextPage = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const logout = () => {
    localStorage.removeItem(LOCALSTORAGE_TOKEN);
    authTokenVar(null);
    isLoggedInVar(false);
  };
  return (
    <div className="w-full flex h-10 justify-between items-center">
      <Link href="/">
        <a className="bg-yellow-300 ml-4 text-3xl">🐬MyMy🖐</a>
      </Link>
      <nav className="w-1/2 flex justify-around">
        <Link href="/realtime">
          <a>REALTIME</a>
        </Link>
        <Link href="/history">
          <a>HISTORY</a>
        </Link>
        <Link href="/admin">
          <a>ADMIN</a>
        </Link>
        {isLoggedIn ? <button onClick={logout}>LOGOUT</button> : null}
      </nav>
    </div>
  );
};
export default NavBar;
