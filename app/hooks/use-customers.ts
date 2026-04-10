import useSWR from "swr";

export interface CustomerResult {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  landmark: string | null;
  city: string | null;
  pincode: string | null;
  gst_number: string | null;
  notes: string | null;
  address_lat: number | null;
  address_lng: number | null;
  full_address: string | null;
  created_at: string;
}

/**
 * SWR-cached customer search. Caches each unique search term.
 * Pass `null` or a string shorter than 2 chars to skip fetching.
 */
export function useCustomerSearch(query: string) {
  const key =
    query.length >= 2
      ? `/api/customers?search=${encodeURIComponent(query)}`
      : null;

  const { data, isLoading, mutate } = useSWR<CustomerResult[]>(key, {
    keepPreviousData: true,
  });

  return {
    customers: data && key ? data : [],
    isLoading: key ? isLoading : false,
    mutate,
  };
}
