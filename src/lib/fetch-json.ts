/**
 * Posts JSON and safely parses the response body even if a server error
 * returns an empty or non-JSON payload.
 */
export async function postJson<TResponse>(
  url: string,
  body?: unknown
): Promise<{ ok: boolean; status: number; data: TResponse & { error?: string } }> {
  const res = await fetch(url, {
    method: "POST",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = {} as TResponse & { error?: string };
  if (text) {
    try {
      data = JSON.parse(text) as TResponse & { error?: string };
    } catch {
      data = { error: `Request failed (${res.status}). Please try again.` } as TResponse & {
        error?: string;
      };
    }
  } else if (!res.ok) {
    data = { error: `Request failed (${res.status}). Please try again.` } as TResponse & {
      error?: string;
    };
  }

  return { ok: res.ok, status: res.status, data };
}
