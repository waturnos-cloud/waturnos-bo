/**
 * Hook para manejar estado de formulario dinámico con validación y reset.
 * Reutilizable en modales de creación (proveedores, organizaciones, clientes, etc.)
 */
import { useState, useCallback } from 'react';

export interface FormState {
  [key: string]: string | number | boolean | null;
}

export interface UseFormReturn<T extends FormState> {
  formData: T;
  setFormData: (data: T) => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleToggle: (fieldName: keyof T) => void;
  handleSetField: (fieldName: keyof T, value: any) => void;
  reset: () => void;
  setInitialData: (data: T) => void;
}

export function useForm<T extends FormState>(initialData: T): UseFormReturn<T> {
  const [formData, setFormData] = useState<T>(initialData);
  const [initialState] = useState<T>(initialData);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleToggle = useCallback((fieldName: keyof T) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  }, []);

  const handleSetField = useCallback((fieldName: keyof T, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const reset = useCallback(() => {
    setFormData(initialState);
  }, [initialState]);

  const setInitialData = useCallback((data: T) => {
    setFormData(data);
  }, []);

  return {
    formData,
    setFormData,
    handleChange,
    handleToggle,
    handleSetField,
    reset,
    setInitialData,
  };
}
