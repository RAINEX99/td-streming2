import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function useDatabase() {
  const [dbStatus, setDbStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);

  // Health check query
  const healthQuery = useQuery({
    queryKey: ['/api/health'],
    queryFn: async () => {
      const response = await fetch('/api/health');
      if (!response.ok) throw new Error('Database connection failed');
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: false,
  });

  // Update status based on health check
  useEffect(() => {
    if (healthQuery.isLoading) {
      setDbStatus('connecting');
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
