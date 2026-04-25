// USER テーブル
export interface User {
  id: number;
  username: string;
  password?: string;
}

// POINT テーブル
export interface Point {
  id: number;
  point: number;
  add_date: string;
  user_id: number;
}

// SNOWREMOVAL テーブル
export interface SnowRemoval {
  id: number;
  latitude: number;
  longitude: number;
  comment: string;
  reg_date: string;
  iscleared: boolean;
  photo: string; // base64
  user_id: number;
}

// API リクエスト型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateSnowRemovalRequest {
  latitude: number;
  longitude: number;
  comment: string;
  photo: string;
  user_id: number;
}

export interface CreatePointRequest {
  point: number;
  user_id: number;
}
