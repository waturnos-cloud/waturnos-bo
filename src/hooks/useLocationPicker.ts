/**
 * Hook para manejar selección de ubicación en mapa (Leaflet).
 * Reutilizable en DashOrganizations y otras páginas con mapas.
 */
import { useState, useCallback } from 'react';

export interface LocationState {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface UseLocationPickerReturn {
  location: LocationState;
  setLocation: (location: LocationState) => void;
  updateName: (name: string) => void;
  updateAddress: (address: string) => void;
  updateCoordinates: (lat: number, lng: number) => void;
  reset: (initialLocation: LocationState) => void;
}

const DEFAULT_LOCATION: LocationState = {
  name: 'Ubicación principal',
  address: '',
  lat: -37.33,
  lng: -59.13,
};

export function useLocationPicker(
  initialLocation: LocationState = DEFAULT_LOCATION
): UseLocationPickerReturn {
  const [location, setLocation] = useState<LocationState>(initialLocation);

  const updateName = useCallback((name: string) => {
    setLocation((prev) => ({ ...prev, name }));
  }, []);

  const updateAddress = useCallback((address: string) => {
    setLocation((prev) => ({ ...prev, address }));
  }, []);

  const updateCoordinates = useCallback((lat: number, lng: number) => {
    setLocation((prev) => ({ ...prev, lat, lng }));
  }, []);

  const reset = useCallback((initialLoc: LocationState) => {
    setLocation(initialLoc);
  }, []);

  return {
    location,
    setLocation,
    updateName,
    updateAddress,
    updateCoordinates,
    reset,
  };
}
