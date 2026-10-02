import { useState, useEffect, useCallback, useRef } from 'react';
import { supplierApi } from '../services/mockSupplierApi';

export interface SupplierBalanceState {
  balanceBDT: number;
  isLowBalance: boolean;
  isLoading: boolean;
  lastFetched: Date | null;
  refetch: () => Promise<number>;
}

// Global cached balance state to share across components
let globalCachedBalanceBDT: number = 45000;
let globalLastFetched: Date | null = null;

/**
 * Custom Hook: useSupplierBalance
 * Fetches and caches the Supplier API balance every 60 seconds.
 * Provides real-time low-balance detection for checkout & order buttons.
 */
export const useSupplierBalance = (requiredPriceBDT?: number, thresholdBDT: number = 1000): SupplierBalanceState => {
  const [balanceBDT, setBalanceBDT] = useState<number>(globalCachedBalanceBDT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(globalLastFetched);
  const isMounted = useRef<boolean>(true);

  const fetchBalance = useCallback(async (): Promise<number> => {
    try {
      setIsLoading(true);

      let fetchedVal = supplierApi.getSupplierBalance();

      // Attempt live endpoint status check
      try {
        const res = await fetch('/api/supplier/cache-status', { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          if (data?.success) {
            fetchedVal = supplierApi.getSupplierBalance();
          }
        }
      } catch {
        // Silent fallback to local instance
        fetchedVal = supplierApi.getSupplierBalance();
      }

      globalCachedBalanceBDT = fetchedVal;
      globalLastFetched = new Date();

      if (isMounted.current) {
        setBalanceBDT(fetchedVal);
        setLastFetched(globalLastFetched);
        setIsLoading(false);
      }

      return fetchedVal;
    } catch {
      const fallbackVal = supplierApi.getSupplierBalance();
      if (isMounted.current) {
        setBalanceBDT(fallbackVal);
        setIsLoading(false);
      }
      return fallbackVal;
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchBalance();

    // Cache refresh interval every 60 seconds (60,000 ms)
    const interval = setInterval(() => {
      fetchBalance();
    }, 60000);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchBalance]);

  const minRequired = requiredPriceBDT || thresholdBDT;
  const isLowBalance = balanceBDT < minRequired;

  return {
    balanceBDT,
    isLowBalance,
    isLoading,
    lastFetched,
    refetch: fetchBalance
  };
};
