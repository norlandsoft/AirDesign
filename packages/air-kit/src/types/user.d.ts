export interface UserLoginRequest {
  id: string;
  password: string;
  /** 管理员登录：本地鉴权通道 POST /rest/auth/login（仅密码） */
  adminMode?: boolean;
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

export interface AdminPasswordChangeRequest {
  password: string;
}
