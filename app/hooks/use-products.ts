import { useCallback, useMemo } from "react";
import useSWR from "swr";

export interface ProductResult {
  serviceItemId: number;
  productName: string;
  brandNames: string[];
  issues: string[];
  category: string;
}

/**
 * Loads ALL store products once and caches them.
 * Use `filterProducts(query)` for client-side search instead of hitting the API.
 */
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<ProductResult[]>(
    "/api/products",
    {
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  );

  const filterProducts = useCallback(
    (query: string): ProductResult[] => {
      if (!data || query.length < 1) return [];
      const q = query.toLowerCase();
      return data.filter((p) => p.productName.toLowerCase().includes(q));
    },
    [data],
  );

  const grouped = useMemo(() => {
    if (!data) return {};
    return data.reduce(
      (acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p);
        return acc;
      },
      {} as Record<string, ProductResult[]>,
    );
  }, [data]);

  return {
    products: data || [],
    grouped,
    filterProducts,
    isLoading,
    error,
    mutate,
  };
}
