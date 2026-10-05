import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createManyOptions, deleteOption, getOptions } from './wheelService';

export const WHEEL_OPTIONS_QUERY_KEY = ['wheel', 'options'];

export const wheelOptionsQueryOptions = () => ({
  queryKey: WHEEL_OPTIONS_QUERY_KEY,
  queryFn: getOptions,
  staleTime: 30_000,
});

export function useWheelOptions() {
  return useQuery(wheelOptionsQueryOptions());
}

export function useCreateWheelOptions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createManyOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WHEEL_OPTIONS_QUERY_KEY }),
  });
}

export function useDeleteWheelOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOption,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WHEEL_OPTIONS_QUERY_KEY }),
  });
}
