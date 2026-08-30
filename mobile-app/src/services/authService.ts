import { apiClient } from "@/lib/apiClient";
import type { LoginFormValues } from "@/schemas/authSchema";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  login: async (payload: LoginFormValues): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      payload,
    );
    return data;
  },
};
