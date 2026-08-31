import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../api/clientsApi';

// Hook de consultation des clients avec support de recherche et pagination
export function useClientsQuery(query?: string, limit: number = 50, page: number = 1) {
  return useQuery({
    queryKey: ['clients', { query, limit, page }],
    queryFn: () => clientsApi.getAll(query, limit, page),
  });
}

// Hook de consultation détaillée d'un client par ID
export function useClientDetailsQuery(clientId: string) {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientsApi.getById(clientId),
    enabled: !!clientId,
  });
}

// Hook de création de client avec Mise à Jour Optimiste et Invalidation de Cache
export function useCreateClientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newClient: any) => clientsApi.create(newClient),
    // Optimistic Update : Insertion préventive dans le cache UI avant confirmation serveur
    onMutate: async (newClient) => {
      await queryClient.cancelQueries({ queryKey: ['clients'] });
      const previousClients = queryClient.getQueryData(['clients']);

      queryClient.setQueryData(['clients'], (old: any[] = []) => [
        { ...newClient, id: `temp-${Date.now()}`, customerCode: 'CLI-000000' },
        ...old,
      ]);

      return { previousClients };
    },
    onError: (_err, _newClient, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(['clients'], context.previousClients);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
