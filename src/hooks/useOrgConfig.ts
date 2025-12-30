import { useQuery } from '@tanstack/react-query';
import { fetchOrgConfig } from '../api/orgConfig';
import type { OrgConfig } from '../api/orgConfig';

/**
 * React hook to fetch and cache organization configuration
 * 
 * Features:
 * - Global caching (shared across all components)
 * - 5-minute stale time (matches backend cache)
 * - Automatic token handling via axios interceptor
 * - Only fetches when user is authenticated
 * 
 * @returns Object with config, loading, and error states
 */
export function useOrgConfig() {
  const { data: config, isLoading, error } = useQuery<OrgConfig>({
    queryKey: ['orgConfig'],
    queryFn: fetchOrgConfig,
    enabled: !!localStorage.getItem('token'), // Only fetch if authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend cache TTL)
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: 2, // Retry failed requests twice
  });

  return {
    config,
    loading: isLoading,
    error: error as Error | null,
  };
}

