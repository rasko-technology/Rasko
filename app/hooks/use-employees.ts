import useSWR from "swr";

export interface Employee {
  id: number;
  name: string;
  username: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Loads all employees once and caches. Reused across leads, jobcards, etc.
 */
export function useEmployees() {
  const { data, error, isLoading, mutate } = useSWR<Employee[]>(
    "/api/employees",
    {
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    employees: data || [],
    isLoading,
    error,
    mutate,
  };
}
