import { getDeviceId } from "@/lib/device";
import { api } from "@/lib/axios";
import type { LoginResponse } from "@/types/auth";

export type LoginRequest = {
  username: string;
  password: string;
};

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const idDevice = await getDeviceId();

  const response = await api.post<LoginResponse>("/api/auth", {
    ...data,
    idDevice,
  });

  return response.data;
}
