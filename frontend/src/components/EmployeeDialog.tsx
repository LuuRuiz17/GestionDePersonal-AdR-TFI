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
import type { Employee } from './ManageEmployees';
import type { Position } from './ManagePositions';

interface EmployeeDialogProps {
  isOpen: boolean;
  employee: Employee | null;
  positions: Position[];
  onSave: (employee: Employee) => void;
  onClose: () => void;
}

export function EmployeeDialog({ isOpen, employee, positions, onSave, onClose }: EmployeeDialogProps) {
  const [formData, setFormData] = useState<Employee>({
    id: '',
    dni: '',
    name: '',
    lastName: '',
    address: '',
    birthDate: '',
    hireDate: '',
    positionId: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        id: '',
        dni: '',
        name: '',
        lastName: '',
        address: '',
        birthDate: '',
        hireDate: '',
        positionId: '',
        email: '',
        phone: '',
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    // Validar DNI (7-8 dígitos)
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{7,8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 7 u 8 dígitos numéricos';
    }

    // Validar nombre (2-50 caracteres, solo letras y espacios)
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres';
    } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(formData.name)) {
      newErrors.name = 'El nombre solo puede contener letras y espacios';
    }

    // Validar apellido (2-50 caracteres, solo letras y espacios)
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = 'El apellido no puede exceder 50 caracteres';
    } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'El apellido solo puede contener letras y espacios';
    }

    // Validar domicilio (5-100 caracteres)
    if (!formData.address.trim()) {
      newErrors.address = 'El domicilio es obligatorio';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'El domicilio debe tener al menos 5 caracteres';
    } else if (formData.address.trim().length > 100) {
      newErrors.address = 'El domicilio no puede exceder 100 caracteres';
    }

    // Validar fecha de nacimiento
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.birthDate = 'El empleado debe ser mayor de 18 años';
      } else if (age > 100) {
        newErrors.birthDate = 'La fecha de nacimiento no es válida';
      }
    }

    // Validar fecha de contratación
    if (!formData.hireDate) {
      newErrors.hireDate = 'La fecha de contratación es obligatoria';
    } else {
      const hireDate = new Date(formData.hireDate);
      const today = new Date();
      if (hireDate > today) {
        newErrors.hireDate = 'La fecha de contratación no puede ser futura';
      }
      if (formData.birthDate) {
        const birthDate = new Date(formData.birthDate);
        const ageAtHire = hireDate.getFullYear() - birthDate.getFullYear();
        if (ageAtHire < 18) {
          newErrors.hireDate = 'La persona debe tener al menos 18 años al momento de contratación';
        }
      }
    }

    // Validar puesto
    if (!formData.positionId) {
      newErrors.positionId = 'Debe seleccionar un puesto';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    // Validar teléfono (formato argentino flexible)
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^[\d\s\-\+\(\)]{8,20}$/.test(formData.phone)) {
      newErrors.phone = 'Ingrese un número de teléfono válido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave(formData);
  };

  const handleChange = (field: keyof Employee, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNumberInput = (field: keyof Employee, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setFormData({ ...formData, [field]: numericValue });
  };

  const selectedPosition = positions.find((p) => p.id === formData.positionId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Modificar Empleado' : 'Agregar Nuevo Empleado'}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? 'Modifique los datos del empleado'
              : 'Complete la información del nuevo empleado'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni">
                  DNI <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => handleNumberInput('dni', e.target.value)}
                  placeholder="Ej: 12345678"
                  maxLength={8}
                  required
                  className={errors.dni ? 'border-red-500' : ''}
                />
                {errors.dni && <p className="text-sm text-red-500">{errors.dni}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Ej: +54 11 1234-5678"
                  required
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Juan"
                  maxLength={50}
                  required
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Apellido <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Ej: Pérez"
                  maxLength={50}
                  required
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Domicilio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Ej: Av. Corrientes 1234, CABA"
                maxLength={100}
                required
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className={errors.birthDate ? 'border-red-500' : ''}
                />
                {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">
                  Fecha de Contratación <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleChange('hireDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className={errors.hireDate ? 'border-red-500' : ''}
                />
                {errors.hireDate && <p className="text-sm text-red-500">{errors.hireDate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="positionId">
                Puesto <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.positionId}
                onValueChange={(value) => handleChange('positionId', value)}
                required
              >
                <SelectTrigger className={errors.positionId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccione un puesto" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.name} - {position.sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.positionId && <p className="text-sm text-red-500">{errors.positionId}</p>}
              {selectedPosition && (
                <p className="text-sm text-gray-600">
                  Sector: <span className="text-blue-600">{selectedPosition.sector}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Correo Electrónico <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Ej: empleado@empresa.com"
                required
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{employee ? 'Guardar Cambios' : 'Agregar Empleado'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}