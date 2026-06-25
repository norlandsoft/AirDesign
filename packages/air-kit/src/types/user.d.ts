export interface UserLoginRequest {
  id: string;
  password: string;
}

export interface UserResponse {
  id: string;
  loginId?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
  role?: string;
  [key: string]: any;
}
