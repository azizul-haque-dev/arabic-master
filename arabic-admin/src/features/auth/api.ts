import { api } from "@/lib/axios";
import type { ApiResponse, User } from "@/types";

export interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
}

export async function loginRequest(input: LoginInput): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", input);
  return data.data;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>("/users/me");
  return data.data;
}

// Called once on app load to silently exchange the refresh cookie for a
// fresh access token, so a page refresh doesn't force a re-login.
export async function silentRefresh(): Promise<string> {
  const { data } = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh");
  return data.data.accessToken;
}
