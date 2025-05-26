import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { StreamingAccount, InsertStreamingAccount } from "@shared/schema";

interface AccountFilters {
  search?: string;
  platform?: string;
  accountType?: string;
}

export function useAccounts(filters: AccountFilters = {}) {
  const queryClient = useQueryClient();

  // Build query params
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.platform && filters.platform !== 'all') queryParams.append('platform', filters.platform);
  if (filters.accountType && filters.accountType !== 'all') queryParams.append('accountType', filters.accountType);

  // Fetch accounts
  const accountsQuery = useQuery<StreamingAccount[]>({
    queryKey: ['/api/accounts', queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/accounts?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return response.json();
    },
  });

  // Fetch statistics
  const statisticsQuery = useQuery({
    queryKey: ['/api/accounts/statistics'],
    queryFn: async () => {
      const response = await fetch('/api/accounts/statistics');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    },
  });

  // Create account mutation
  const createAccountMutation = useMutation({
    mutationFn: async (data: InsertStreamingAccount) => {
      return apiRequest('POST', '/api/accounts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts/statistics'] });
    },
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertStreamingAccount> }) => {
      return apiRequest('PUT', `/api/accounts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts/statistics'] });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts/statistics'] });
    },
  });

  // Export accounts
  const exportAccounts = async () => {
    const response = await fetch('/api/accounts/export/json');
    if (!response.ok) throw new Error('Failed to export accounts');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'streaming_accounts.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Import accounts
  const importAccounts = async (accounts: any[]) => {
    return apiRequest('POST', '/api/accounts/import', { accounts });
  };

  return {
    accounts: accountsQuery.data || [],
    statistics: statisticsQuery.data || { total: 0, active: 0, expiring: 0, expired: 0 },
    isLoading: accountsQuery.isLoading || statisticsQuery.isLoading,
    error: accountsQuery.error || statisticsQuery.error,
    refetch: () => {
      accountsQuery.refetch();
      statisticsQuery.refetch();
    },
    createAccountMutation,
    updateAccountMutation,
    deleteAccountMutation,
    exportAccounts,
    importAccounts,
  };
}
