import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

// Hook de lecture du Dashboard Atelier avec Rafraîchissement Automatique (Refetch 30s)
export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 30000, // Rafraîchissement automatique du dashboard toutes les 30 secondes
    staleTime: 10000,
  });
}
