/**
 * Componente reutilizable: Buscador + Filtrador para listas.
 * Usado en DashOrganizations y expandible a otras páginas.
 */
import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface FilterConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}

export interface SearchAndFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  gap?: number;
}

export function SearchAndFilter({
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters = [],
  gap = 2,
}: SearchAndFilterProps) {
  return (
    <Box sx={{ display: 'flex', gap, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Filtros select */}
      {filters.map((filter) => (
        <TextField
          key={filter.label}
          select
          size="small"
          label={filter.label}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ minWidth: 150, backgroundColor: 'white', borderRadius: 1 }}
        >
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </TextField>
      ))}

      {/* Buscador */}
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 250, backgroundColor: 'white', borderRadius: 1, flex: 1 }}
      />
    </Box>
  );
}
