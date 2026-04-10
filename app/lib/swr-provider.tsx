"use client";

import { SWRConfig } from "swr";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("API error");
    return r.json();
  });

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        dedupingInterval: 60_000,
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
}
