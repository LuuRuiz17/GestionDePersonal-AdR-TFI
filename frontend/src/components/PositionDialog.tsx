import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { Position } from './ManagePositions';

interface PositionDialogProps {
  isOpen: boolean;
  position: Position | null;
  onSave: (position: Position) => void;
  onClose: () => void;
  existingSectors: string[];
}

interface ApiSector {
  id: number;
  nombre: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export function PositionDialog({ isOpen, position, onSave, onClose, existingSectors }: PositionDialogProps) {
  const [formData, setFormData] = useState<Position>({
    id: '',
    name: '',
    sector: '',
    sectorId: undefined,
    hourlyRate: 0,
    minDailyHours: 0,
  });
  const [sectors, setSectors] = useState<ApiSector[]>([]);
  const [isLoadingSectors, setIsLoadingSectors] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar sectores desde la API
  useEffect(() => {
    if (isOpen) {
      const fetchSectors = async () => {
        setIsLoadingSectors(true);
        const token = localStorage.getItem('authToken');
        
        try {
          const response = await fetch(API_BASE_URL + '/api/supervisors/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Sectores cargados desde API:', data);
            
            if (data.sectores && Array.isArray(data.sectores)) {
              setSectors(data.sectores);
            }
          }
        } catch (error) {
          console.error('Error al cargar sectores:', error);
        } finally {
          setIsLoadingSectors(false);
        }
      };

      fetchSectors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (position) {
      setFormData(position);
    } else {
      setFormData({
        id: '',
        name: '',
        sector: '',
        sectorId: undefined,
        hourlyRate: 0,
        minDailyHours: 0,
      });
    }
    setErrors({});
  }, [position, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    // Validar nombre del puesto (3-100 caracteres)
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del puesto es obligatorio';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar sector
    if (!formData.sectorId) {
      newErrors.sector = 'El sector es obligatorio';
    }

    // Validar pago por hora (debe ser positivo)
    if (!formData.hourlyRate || formData.hourlyRate <= 0) {
      newErrors.hourlyRate = 'El pago por hora debe ser mayor a 0';
    } else if (formData.hourlyRate > 100000) {
      newErrors.hourlyRate = 'El pago por hora es demasiado alto';
    }

    // Validar horas mínimas de trabajo diario
    if (!formData.minDailyHours || formData.minDailyHours <= 0) {
      newErrors.minDailyHours = 'Las horas mínimas deben ser mayor a 0';
    } else if (formData.minDailyHours > 24) {
      newErrors.minDailyHours = 'Las horas mínimas no pueden exceder 24';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(formData);
  };

  const handleChange = (field: keyof Position, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error del campo al editar
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSectorChange = (value: string) => {
    const sectorId = parseInt(value);
    const selectedSector = sectors.find(s => s.id === sectorId);
    
    if (selectedSector) {
      setFormData({ 
        ...formData, 
        sector: selectedSector.nombre,
        sectorId: selectedSector.id
      });
    }
    
    // Limpiar error del sector
    if (errors.sector) {
      setErrors({ ...errors, sector: '' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {position ? 'Modificar Puesto' : 'Agregar Nuevo Puesto'}
          </DialogTitle>
          <DialogDescription>
            {position
              ? 'Modifique los datos del puesto'
              : 'Complete la información del nuevo puesto'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del Puesto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej: Gerente de Ventas"
                maxLength={100}
                required
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sector">
                Sector que pertenece <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.sectorId ? String(formData.sectorId) : ''}
                onValueChange={handleSectorChange}
                required
                disabled={isLoadingSectors}
              >
                <SelectTrigger className={errors.sector ? 'border-red-500' : ''}>
                  <SelectValue placeholder={isLoadingSectors ? "Cargando sectores..." : "Seleccione un sector"} />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={String(sector.id)}>
                      {sector.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sector && <p className="text-sm text-red-500">{errors.sector}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">
                Pago por hora <span className="text-red-500">*</span>
              </Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    handleChange('hourlyRate', value);
                  } else if (e.target.value === '') {
                    handleChange('hourlyRate', 0);
                  }
                }}
                placeholder="Ej: 15.50"
                required
                className={errors.hourlyRate ? 'border-red-500' : ''}
              />
              {errors.hourlyRate && <p className="text-sm text-red-500">{errors.hourlyRate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minDailyHours">
                Horas mínimas de trabajo diario <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minDailyHours"
                type="number"
                min="0"
                max="24"
                step="0.1"
                value={formData.minDailyHours || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 24) {
                    handleChange('minDailyHours', value);
                  } else if (e.target.value === '') {
                    handleChange('minDailyHours', 0);
                  }
                }}
                placeholder="Ej: 6"
                required
                className={errors.minDailyHours ? 'border-red-500' : ''}
              />
              {errors.minDailyHours && <p className="text-sm text-red-500">{errors.minDailyHours}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{position ? 'Guardar Cambios' : 'Agregar Puesto'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}