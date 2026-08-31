import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';

// Hook de lecture des commandes avec cache TanStack Query
export function useOrdersQuery() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll(),
  });
}

// Hook de lecture du détail d'une commande
export function useOrderDetailsQuery(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId),
    enabled: !!orderId,
  });
}

// Hook de la Timeline 8 étapes
export function useOrderTimelineQuery(orderId: string) {
  return useQuery({
    queryKey: ['order-timeline', orderId],
    queryFn: () => ordersApi.getTimeline(orderId),
    enabled: !!orderId,
  });
}

// Hook de création de commande avec Invalidation de Cache
export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOrder: any) => ordersApi.create(newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Hook de transition de statut de commande avec Optimistic Update
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, changedBy, comment }: { id: string; status: string; changedBy?: string; comment?: string }) =>
      ordersApi.updateStatus(id, status, changedBy, comment),
    
    // Optimistic Update : Mise à jour immédiate du statut dans l'interface sans attendre le retour réseau
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      await queryClient.cancelQueries({ queryKey: ['order', id] });

      const previousOrders = queryClient.getQueryData<any[]>(['orders']);

      if (previousOrders) {
        queryClient.setQueryData(['orders'], (old: any[] = []) =>
          old.map((ord) => (ord.id === id ? { ...ord, status } : ord))
        );
      }

      return { previousOrders };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['order-timeline', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
