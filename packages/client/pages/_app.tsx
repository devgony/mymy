import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ApolloProvider, useReactiveVar } from '@apollo/client';
import client, { isLoggedInVar } from '../apollo-client';
import NavBar from '../components/NavBar';
import Login from '../components/Login';

function MyApp({ Component, pageProps }: AppProps) {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  return (
    <ApolloProvider client={client}>
      <div className="h-screen">
        <NavBar />
        {isLoggedIn ? <Component {...pageProps} /> : <Login />}
      </div>
    </ApolloProvider>
  );
}

export default MyApp;
