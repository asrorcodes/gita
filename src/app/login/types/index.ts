export interface SignInRequest {
  login: string;
  password: string;
}

export interface SignInResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenRequest {
  token: string;
}

export interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
