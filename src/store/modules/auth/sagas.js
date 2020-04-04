import { takeLatest, call, put, all } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { signInSuccess, signFailure } from './actions';
import api from '~/services/api';
import history from '~/services/history';

export function* signIn({ payload }) {
    try {
        const { email, password } = payload;

        const response = yield call(api.post, 'session', {
            email,
            password,
        });

        const { token, user } = response.data;

        if (!user.provider) {
            toast.error('O usuário não é um prestador');
            return;
        }

        api.defaults.headers.Authorization = `Bearer ${token}`;
        yield put(signInSuccess(token, user));
        history.push('/dashboard');
    } catch (err) {
        toast.error('Falha na autenticação, verifique seus dados');
        yield put(signFailure());
    }
}

export function* signUp({ payload }) {
    try {
        const { email, password, name } = payload;

        yield call(api.post, 'users', {
            name,
            email,
            password,
            provider: true,
        });

        history.push('/');
    } catch (err) {
        toast.error('Falha no cadastro, verifique seus dados');
        yield put(signFailure());
    }
}

export function setToken({ payload }) {
    if (!payload) return;

    const { token } = payload.auth;

    if (token) {
        api.defaults.headers.Authorization = `Bearer ${token}`;
    }
}
export default all([
    takeLatest('persist/REHYDRATE', setToken),

    takeLatest('@auth/SIGN_IN_REQUEST', signIn),
    takeLatest('@auth/SIGN_UP_REQUEST', signUp),
]);