import { api } from "@/lib/axios";
import type { LoginResponse } from "@/types/auth";

export type LoginRequest = {
  username: string;
  password: string;
};

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/auth", data);

  return response.data;
}
