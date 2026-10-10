export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({ ok: false, error: "Invalid response" }));
  if (!res.ok || !body.ok) {
    throw new ApiError(body.error || "Request failed", res.status);
  }
  return body.data;
}

export const api = {
  get: (url) => request(url),
  post: (url, data) => request(url, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  patch: (url, data) => request(url, { method: "PATCH", body: JSON.stringify(data) }),
  del: (url) => request(url, { method: "DELETE" }),
};
