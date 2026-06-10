const getBaseUrl = () => {
  const env = import.meta.env?.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

async function request(path, options = {}) {
  const base = getBaseUrl();
  const token = localStorage.getItem("chapaquiz_token");

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function login({ phone, password }) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
}

export async function register({ phone, nickname, password, email }) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ phone, nickname, password, email: email || undefined }),
  });
}

export async function getMe() {
  return request("/api/users/me");
}

export function saveSession({ token, user }) {
  localStorage.setItem("chapaquiz_token", token);
  localStorage.setItem("chapaquiz_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("chapaquiz_token");
  localStorage.removeItem("chapaquiz_user");
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("chapaquiz_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
