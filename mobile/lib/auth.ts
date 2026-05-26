import { api, setToken, removeToken } from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await api.post("/api/auth/login", { email, password });
  await setToken(res.data.token);
  return res.data.user;
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const res = await api.post("/api/auth/register", { name, email, password });
  await setToken(res.data.token);
  return res.data.user;
}

export async function logout() {
  await removeToken();
}

export async function getMe(): Promise<User | null> {
  try {
    const res = await api.get("/api/auth/me");
    return res.data.user;
  } catch {
    return null;
  }
}
