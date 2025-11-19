/**
 * Componente reutilizable: Marker interactivo para Leaflet.
 * Extraído de DashOrganizations para evitar duplicación.
 */
import React, { useEffect } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
import L from '../utils/leafletConfig';
import type { LatLngExpression, DragEndEvent, LeafletMouseEvent } from 'leaflet';

export interface LocationMarkerProps {
  position: { lat: number; lng: number; name?: string; address?: string };
  onPositionChange: (lat: number, lng: number) => void;
  draggable?: boolean;
  clickToPlace?: boolean;
}

export function LocationMarker({
  position,
  onPositionChange,
  draggable = true,
  clickToPlace = true,
}: LocationMarkerProps) {
  // Click en el mapa para colocar marker
  useMapEvents({
    click(e: LeafletMouseEvent) {
      if (clickToPlace) {
        onPositionChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const latlng = (event.target as L.Marker).getLatLng();
    onPositionChange(latlng.lat, latlng.lng);
  };

  return (
    <Marker
      position={[position.lat, position.lng] as LatLngExpression}
      draggable={draggable}
      eventHandlers={{
        dragend: handleDragEnd,
      }}
    />
  );
}
