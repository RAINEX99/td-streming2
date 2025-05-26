import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function useDatabase() {
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [isConnecting, setIsConnecting] = useState(false);

  // Health check query
  const healthQuery = useQuery({
    queryKey: ['/api/health'],
    queryFn: async () => {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error('Database connection failed');
      return response.json();
    },
    refetchInterval: 10000, // Check every 10 seconds
    retry: 2,
  });

  // Update status based on health check
  useEffect(() => {
    if (healthQuery.isLoading && !healthQuery.data) {
      setDbStatus('connecting');
    } else if (healthQuery.error) {
      setDbStatus('disconnected');
    } else if (healthQuery.data?.status === 'connected') {
      setDbStatus('connected');
    } else {
      setDbStatus('disconnected');
    }
  }, [healthQuery.isLoading, healthQuery.data, healthQuery.error]);

  const testConnection = async () => {
    setIsConnecting(true);
    setDbStatus('connecting');
    
    try {
      await healthQuery.refetch();
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    dbStatus,
    isConnecting,
    testConnection,
    healthData: healthQuery.data,
  };
}
