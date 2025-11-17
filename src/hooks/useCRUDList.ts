/**
 * Hook reutilizable para manejar CRUD básico: listar, crear, eliminar elementos.
 * Reduce duplicación de código entre DashProviders, DashOrganizations, etc.
 */
import { useState, useCallback } from 'react';

export interface CRUDListState<T> {
  items: T[];
  filtered: T[];
  loading: boolean;
  creating: boolean;
}

export interface CRUDListActions<T> {
  setItems: (items: T[]) => void;
  setFiltered: (items: T[]) => void;
  setLoading: (loading: boolean) => void;
  setCreating: (creating: boolean) => void;
  reload: () => Promise<void>;
  addItem: (item: T) => void;
  removeItem: (id: any) => void;
  filterBy: (predicate: (item: T) => boolean) => void;
  resetFilters: () => void;
}

export function useCRUDList<T extends { id?: number | string }>(
  loadFn: () => Promise<T[]>
): CRUDListState<T> & CRUDListActions<T> {
  const [items, setItems] = useState<T[]>([]);
  const [filtered, setFiltered] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loadFn();
      setItems(data);
      setFiltered(data);
    } catch (err) {
      console.error('Error reloading CRUD list:', err);
    } finally {
      setLoading(false);
    }
  }, [loadFn]);

  const addItem = useCallback((item: T) => {
    setItems((prev) => [...prev, item]);
    setFiltered((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((id: any) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setFiltered((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const filterBy = useCallback(
    (predicate: (item: T) => boolean) => {
      setFiltered(items.filter(predicate));
    },
    [items]
  );

  const resetFilters = useCallback(() => {
    setFiltered(items);
  }, [items]);

  return {
    items,
    filtered,
    loading,
    creating,
    setItems,
    setFiltered,
    setLoading,
    setCreating,
    reload,
    addItem,
    removeItem,
    filterBy,
    resetFilters,
  };
}
