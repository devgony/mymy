import { gql, useMutation, useQuery } from '@apollo/client';
import type { InferGetServerSidePropsType, NextPage } from 'next';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import client, { authTokenVar, isLoggedInVar } from '../apollo-client';
import {
  LoginInput,
  LoginMutation,
  LoginMutationVariables,
} from '../generated/graphql';
import { LOCALSTORAGE_TOKEN, TITLE } from '../utils/const';

const LOGIN = gql`
  mutation login($input: LoginInput!) {
    login(input: $input) {
      ok
      token
      error
    }
  }
`;

const Login: NextPage = () => {
  const { register, getValues, handleSubmit, formState } = useForm<LoginInput>({
    mode: 'onChange',
  });
  const onCompleted = (data: LoginMutation) => {
    const {
      login: { ok, token, error },
    } = data;
    if (ok && token) {
      localStorage.setItem(LOCALSTORAGE_TOKEN, token);
      authTokenVar(token);
      isLoggedInVar(true);
    } else {
      alert(error);
    }
  };
  const [login, { data: loginResult, loading }] = useMutation<
    LoginMutation,
    LoginMutationVariables
  >(LOGIN, { onCompleted });
  const onSubmit = () => {
    const { username, password } = getValues();
    console.log(username, password);
    login({
      variables: {
        input: { username, password },
      },
    });
  };
  return (
    <section className="h-full flex justify-center items-center ">
      <Helmet>
        <title>{`Login | ${TITLE}`}</title>
      </Helmet>
      <form
        className="flex flex-col w-80 h-64 shadow-2xl rounded-b-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-center bg-violet-400 h-12 flex flex-col justify-center text-white rounded-t-lg">
          Please Login with admin
        </h1>
        <div className="flex flex-col m-4 h-2/3 justify-around">
          <input
            className="h-10 pl-2 rounded-lg bg-gray-200"
            placeholder="username"
            {...register('username')}
          />
          <input
            className="h-10 pl-2 rounded-lg bg-gray-200"
            placeholder="password"
            type="password"
            {...register('password')}
          />
          <button className="bg-violet-400 h-10 rounded-lg text-white">
            Login
          </button>
        </div>
      </form>
    </section>
  );
};

export default Login;
