// === 型定義 ===

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface SnowRemoval {
  id: number;
  latitude: number;
  longitude: number;
  comment: string;
  reg_date: string;
  iscleared: boolean;
  photo: string;
  user_id: number;
  username?: string;
}

export interface Point {
  id: number;
  point: number;
  add_date: string;
  user_id: number;
}

export interface LoginRequest {
  username: string;
  password: string;
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

// === ベース ===

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders: Record<string, string> = {};
  try {
    const raw = sessionStorage.getItem("authUser");
    if (raw) {
      const u = JSON.parse(raw) as { id: number; role: string };
      authHeaders["X-User-Id"] = String(u.id);
      authHeaders["X-User-Role"] = u.role;
    }
  } catch {}

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// === USER ===

export async function login(body: LoginRequest): Promise<User> {
  return request<User>("/user/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// === SNOWREMOVAL ===

export async function getSnowRemovals(): Promise<SnowRemoval[]> {
  return request<SnowRemoval[]>("/snowremoval");
}

export async function getSnowRemovalById(id: number): Promise<SnowRemoval> {
  return request<SnowRemoval>(`/snowremoval/${id}`);
}

export async function createSnowRemoval(
  body: CreateSnowRemovalRequest,
): Promise<SnowRemoval> {
  return request<SnowRemoval>("/snowremoval", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markAsCleared(id: number): Promise<SnowRemoval> {
  return request<SnowRemoval>(`/snowremoval/${id}/clear`, {
    method: "PUT",
  });
}

export async function deleteSnowRemoval(id: number): Promise<void> {
  return request<void>(`/snowremoval/${id}`, {
    method: "DELETE",
  });
}

// === POINT ===

export async function getPointsByUser(userId: number): Promise<Point[]> {
  return request<Point[]>(`/point/user/${userId}`);
}

export async function createPoint(body: CreatePointRequest): Promise<Point> {
  return request<Point>("/point", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
