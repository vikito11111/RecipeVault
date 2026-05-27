import axios from "axios";
import * as SecureStore from "expo-secure-store";
const BASE_URL = "https://vikito11111recipevault.netlify.app";

export const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getToken() {
  return SecureStore.getItemAsync("auth_token");
}
export async function setToken(token: string) {
  return SecureStore.setItemAsync("auth_token", token);
}
export async function removeToken() {
  return SecureStore.deleteItemAsync("auth_token");
}
