/**
 * Componente reutilizable: Grid de tarjetas seleccionables + tarjeta de crear.
 * Evita duplicación en DashProviders y DashOrganizations.
 */
import React from 'react';
import { Grid, Card, CardContent, CardActionArea, Typography, Box, Avatar, Chip, Stack, IconButton, Divider, Tooltip } from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon, ToggleOff as ToggleOffIcon } from '@mui/icons-material';

export interface CardItem {
  id?: string | number;
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  avatar?: string;
  avatarBg?: string;
  avatarInitial?: string;
  logoUrl?: string;
  type?: string | any;
  active?: boolean;
  categoryType?: 'simple' | 'multi';
}

export interface SelectableCardGridProps<T extends CardItem> {
  items: T[];
  onSelect: (item: T) => void;
  onCreate?: () => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  renderContent?: (item: T) => React.ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  spacing?: number;
  showCreateCard?: boolean;
  cardBgColor?: (item: T) => string;
  logoPlaceholderBg?: (item: T) => string;
}

export function SelectableCardGrid<T extends CardItem>({
  items,
  onSelect,
  onCreate,
  onView,
  onEdit,
  onDelete,
  renderContent,
  xs = 12,
  sm = 6,
  md = 4,
  lg = 3,
  spacing = 3,
  showCreateCard = true,
  cardBgColor,
  logoPlaceholderBg,
}: SelectableCardGridProps<T>) {
  return (
    <Grid container spacing={spacing}>
      {/* Tarjeta crear (si se proporciona handler) */}
      {showCreateCard && onCreate && (
        <Grid item xs={xs} sm={sm} md={md} lg={lg}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              p: 2,
              textAlign: 'center',
              backgroundColor: '#E3F2FD',
              border: '1.5px dashed #64B5F6',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#BBDEFB',
                transform: 'translateY(-3px)',
                borderColor: '#2196F3',
              },
            }}
          >
            <CardActionArea onClick={onCreate}>
              <CardContent>
                <AddIcon sx={{ fontSize: 46, color: '#1976D2', mb: 1 }} />
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  Crear Nuevo
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      )}

      {/* Items */}
      {items.map((item) => (
        <Grid item xs={xs} sm={sm} md={md} lg={lg} key={item.id}>
          <Card
            elevation={3}
            sx={{
              height: '100%',
              borderRadius: 2,
              backgroundColor: cardBgColor ? cardBgColor(item) : 'background.paper',
              transition: 'transform 0.2s ease, box-shadow 0.2s',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            {/* Área clickeable (excluyendo botones de acción) */}
            <CardActionArea onClick={() => onSelect(item)} sx={{ flex: 1 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                {/* Logo o Avatar - CENTRADO */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {item.logoUrl ? (
                    <Box
                      component="img"
                      src={item.logoUrl}
                      alt={item.name}
                      sx={{
                        width: 64,
                        height: 64,
                        objectFit: 'contain',
                        borderRadius: 2,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        color: '#fff',
                        fontSize: 22,
                        bgcolor: logoPlaceholderBg ? logoPlaceholderBg(item) : 'primary.light',
                      }}
                    >
                      {item.avatarInitial ||
                        (item.name
                          ?.split(' ')
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('')
                          .toUpperCase() || 'N')}
                    </Box>
                  )}
                </Box>

                {/* Nombre */}
                {item.name && (
                  <Typography variant="h6" fontWeight={600}>
                    {item.name}
                  </Typography>
                )}
                {item.title && (
                  <Typography variant="h6" fontWeight={600}>
                    {item.title}
                  </Typography>
                )}

                {/* Tipo/Subtítulo */}
                {item.type && (
                  <Typography variant="body2" color="text.secondary">
                    {item.type}
                  </Typography>
                )}
                {item.subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {item.subtitle}
                  </Typography>
                )}
                {item.description && (
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                )}

                {/* Chips: Active + Category */}
                {(item.active !== undefined || item.categoryType) && (
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {item.active !== undefined && (
                      <Chip
                        label={item.active ? 'Activa' : 'Inactiva'}
                        color={item.active ? 'success' : 'default'}
                        size="small"
                      />
                    )}
                    {item.categoryType && (
                      <Chip
                        label={item.categoryType === 'simple' ? 'Simple' : 'Multi'}
                        size="small"
                        sx={{
                          bgcolor:
                            item.categoryType === 'simple'
                              ? 'rgba(76, 175, 80, 0.15)'
                              : 'rgba(0, 123, 255, 0.15)',
                          color:
                            item.categoryType === 'simple'
                              ? '#2E7D32'
                              : '#1565C0',
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* Custom content */}
                {renderContent && <Box sx={{ mt: 1 }}>{renderContent(item)}</Box>}
              </CardContent>
            </CardActionArea>

            {/* Botones de acción (si existen handlers) */}
            {(onView || onEdit || onDelete) && (
              <>
                <Divider />
                <Stack direction="row" spacing={0} sx={{ justifyContent: 'center', p: 1 }}>
                  {onView && (
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onView(item); }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onEdit && (
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title={item.active ? "Desactivar" : "Activar"}>
                      <IconButton 
                        size="small" 
                        color={item.active ? "error" : "success"} 
                        onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                      >
                        <ToggleOffIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
