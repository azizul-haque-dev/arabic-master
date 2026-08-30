import { apiClient } from "@/lib/apiClient";
import type { LoginFormValues, RegisterFormValues } from "@/schemas/authSchema";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authService = {
  login: async (payload: LoginFormValues): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },
  register: async (payload: RegisterFormValues): Promise<AuthResponse> => {
    // acceptedTerms just client-side gate,
    const { fullName, email, password } = payload;
    const { data } = await apiClient.post<AuthResponse>("/auth/register", {
      fullName,
      email,
      password,
    });
    return data;
  },
};
