import axios from 'axios';
import { URL_BACKEND, TOKEN_KEY, REFRESH_KEY ,listaRotasSemAuth} from './variaveis';
import { setTokensStorage, getTokensStorage } from '../api/httpState/usuarioAuth';

console.log('🔌 API URL:', URL_BACKEND);

const api = axios.create({
   baseURL: URL_BACKEND,
   timeout: 20000,
   headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
   async (config) => {
      const token = (await getTokensStorage()).token;
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('📤 Requisição:', config.method?.toUpperCase(), config.url);
      return config;
   },
   (error) => {
      console.error('❌ Erro na requisição:', error);
      return Promise.reject(error);
   }
);

const refreshAuthTokens = async () => {
   try {
      const refreshToken = (await getTokensStorage()).refreshToken;
      if (!refreshToken) {
         throw new Error('Refresh token não encontrado.');
      }
      const response = await axios.post(
         `${URL_BACKEND}/usuario/refresh-token`,
         { refresh_token: refreshToken },
         {
            headers: {
               'Content-Type': 'application/json',
            },
         }
      );
      const { access_token, refresh_token } = response.data.data;
      await setTokensStorage(access_token, refresh_token);
      return { token: access_token, refreshToken: refresh_token };
   } catch (error) {
      console.error('Erro ao atualizar o token:', (error as any)?.response?.data);
      throw error;
   }
};

api.interceptors.response.use(
   (response) => {
      console.log('✅ Resposta:', response.status, response.config.url);
      return response;
   },
   async (error) => {
      console.error('❌ Erro na resposta:', error.response?.status || 'Sem status', error.config?.url, error.message);
      const originalRequest = error.config;
      if(!listaRotasSemAuth.includes(originalRequest.url)){
         if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
               const { token } = await refreshAuthTokens();
               api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
               originalRequest.headers['Authorization'] = `Bearer ${token}`;
               return api(originalRequest);
            } catch (error) {
               return Promise.reject(error);
            }
         }
      }
      return Promise.reject(error);
   }
);

export default api;