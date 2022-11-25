import { WebSocketLink } from '@apollo/client/link/ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
  makeVar,
  split,
} from '@apollo/client';
import { LOCALSTORAGE_TOKEN, TARGET_DB } from './utils/const';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';

const token =
  typeof window !== 'undefined'
    ? localStorage.getItem(LOCALSTORAGE_TOKEN)
    : false;
export const isLoggedInVar = makeVar(Boolean(token));
export const authTokenVar = makeVar(token);

const targetDb =
  typeof window !== 'undefined' ? localStorage.getItem(TARGET_DB) : '';
export const targetDbVar = makeVar(targetDb || '');

const httpLink = createHttpLink({
  // uri: 'http://localhost:4000/graphql',
  uri: 'http://henrypb.asuscomm.com:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'x-jwt': authTokenVar() || '', // escape undefined
    },
  };
});

const wsLink = process.browser
  ? new WebSocketLink(
      new SubscriptionClient('ws://henrypb.asuscomm.com:4000/graphql', {
        connectionParams: {
          'x-jwt': authTokenVar() || '',
        },
      }),
    )
  : null;

const authLinkWithHttp = authLink.concat(httpLink);

const splitLink = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLinkWithHttp,
    )
  : authLinkWithHttp;

const onErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    console.log(`GraphQL Error`, graphQLErrors);
  }
  if (networkError) {
    console.log('Network Error', networkError);
  }
});

const client = new ApolloClient({
  link: from([onErrorLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          isLoggedIn: {
            read() {
              return isLoggedInVar();
            },
          },
          token: {
            read() {
              return authTokenVar();
            },
          },
        },
      },
    },
  }),
});

export default client;
