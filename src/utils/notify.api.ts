// src/api.ts
// Abstraction for POSTing to the notify endpoint using native fetch

const SERVICE_SLUG = "webscanner";

export interface NotifyPayload {
  error: string;
  message: string;
  level: "info" | "warning" | "error" | "critical";
  timestamp?: string | number | Date;
  payload?: Record<string, any> | null;
  token?: string;
}

export async function postToNotify(data: NotifyPayload): Promise<any> {
  const token = process.env.BOTLINE_TOKEN;
  const endpoint = process.env.BOTLINE_ENDPOINT;

  if (!endpoint) throw new Error("BOTLINE_ENDPOINT env var is required");
  if (!token) throw new Error("BOTLINE_TOKEN env var is required");

  // Hardcode service field
  const bodyData = { ...data, service: SERVICE_SLUG };
  if (!bodyData.token) {
    bodyData.token = token;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-request-token": token,
    },
    body: JSON.stringify(bodyData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`POST failed: ${res.status} ${errorText}`);
  }
  return res.json();
}
