import { useCallback, useEffect, useRef, useState } from "react";

import { getErrorMessage } from "@/lib/errors";

export interface UseAsyncDataOptions {
  /** Jalankan loader otomatis saat komponen mount. Default `true`. */
  immediate?: boolean;
  /** Pesan fallback saat loader gagal (selain pesan ApiError). */
  errorMessage?: string;
}

export interface UseAsyncDataResult<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  isLoading: boolean;
  error: string | null;
  /** Muat ulang data secara manual (mis. setelah simpan/hapus). */
  refetch: () => Promise<T | null>;
}

/**
 * Mengelola siklus hidup pemuatan data async: `isLoading`, `error`, dan `refetch`.
 * Menggantikan boilerplate `useState` + `try/catch/finally` + `useEffect` yang
 * berulang di tiap halaman.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  initialData: T,
  options: UseAsyncDataOptions = {},
): UseAsyncDataResult<T> {
  const { immediate = true, errorMessage } = options;

  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const refetch = useCallback(async (): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loaderRef.current();
      setData(result);
      return result;
    } catch (err) {
      setError(getErrorMessage(err, errorMessage ?? "Gagal memuat data."));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (immediate) void refetch();
  }, [immediate, refetch]);

  return { data, setData, isLoading, error, refetch };
}
