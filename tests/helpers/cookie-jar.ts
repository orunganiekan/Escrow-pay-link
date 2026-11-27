import type { NextResponse } from "next/server";

/** A stand-in for next/headers cookies() backed by a plain Map. */
export function createCookieJar() {
  const store = new Map<string, string>();
  return {
    store,
    get: (name: string) => (store.has(name) ? { name, value: store.get(name)! } : undefined),
    /** Copies Set-Cookie values from a route response, as a browser would. */
    absorb(response: NextResponse) {
      for (const c of response.cookies.getAll()) {
        if (c.maxAge === 0 || c.value === "") store.delete(c.name);
        else store.set(c.name, c.value);
      }
    },
    clear: () => store.clear(),
  };
}

export type CookieJar = ReturnType<typeof createCookieJar>;
