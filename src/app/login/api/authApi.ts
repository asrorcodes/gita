import api from "@/service";
import type {
  SignInRequest,
  SignInResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "../types";

const AUTH_BASE = "/center/auth";

export const authApi = {
  signIn: (payload: SignInRequest) =>
    api.post<SignInResponse>(`${AUTH_BASE}/sign-in`, payload),

  refreshToken: (payload: RefreshTokenRequest) =>
    api.post<RefreshTokenResponse>(`${AUTH_BASE}/refresh-token`, payload),
};
