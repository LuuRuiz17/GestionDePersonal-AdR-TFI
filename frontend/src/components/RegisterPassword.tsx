import { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { toast } from 'sonner@2.0.3';
import type { Employee } from './ManageEmployees';

interface RegisterPasswordProps {
  employee: Employee;
  onComplete: () => void;
  onCancel: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export function RegisterPassword({ employee, onComplete, onCancel }: RegisterPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validar contraseña
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'La contraseña debe contener al menos una letra mayúscula';
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'La contraseña debe contener al menos una letra minúscula';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'La contraseña debe contener al menos un número';
    }

    // Validar confirmación de contraseña
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar la contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('authToken');

    try {
      // Construir el objeto para la API
      const requestData = {
        empleado: {
          apellido: employee.lastName,
          nombre: employee.name,
          dni: parseInt(employee.dni),
          correo: employee.email,
          domicilio: employee.address,
          fechaNacimiento: employee.birthDate,
          fechaContratacion: employee.hireDate,
          telefono: employee.phone,
          puesto: {
            id: parseInt(employee.positionId)
          }
        },
        contrasena: password
      };

      console.log('Enviando solicitud POST a /api/employees:', requestData);

      const response = await fetch(API_BASE_URL + '/api/employees/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      console.log('Respuesta completa de la API (POST empleado):', data);

      if (data.status === 'success') {
        toast.success('¡Empleado registrado exitosamente!', {
          description: 'El empleado ha sido creado y puede iniciar sesión en el sistema'
        });

        setIsSuccess(true);

        // Volver a la lista después de 2 segundos
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        toast.error('Error al registrar empleado', {
          description: data.mensaje || 'No se pudo crear el empleado'
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      });
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-green-600 mb-2">¡Contraseña Registrada!</h3>
                <p className="text-gray-600">
                  La cuenta ha sido creada exitosamente
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg w-full text-left space-y-2">
                <p className="text-sm">
                  <span className="text-gray-600">Empleado:</span>{' '}
                  <span>{employee.name} {employee.lastName}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">DNI:</span>{' '}
                  <span>{employee.dni}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h2>Registrar Contraseña</h2>
          <p className="text-gray-600 text-sm mt-1">
            Configure la contraseña para el nuevo empleado
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Crear Contraseña de Acceso
            </CardTitle>
            <CardDescription>
              Establezca una contraseña segura para que el empleado pueda acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del empleado */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nuevo Empleado</p>
                    <p className="font-medium">{employee.name} {employee.lastName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">DNI:</span>{' '}
                    <span className="font-mono">{employee.dni}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>{' '}
                    <span>{employee.email}</span>
                  </div>
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingrese la contraseña"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">La contraseña debe cumplir con:</p>
                  <ul className="text-sm text-gray-500 space-y-1 ml-4">
                    <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-600' : 'bg-gray-400'}`} />
                      Mínimo 8 caracteres
                    </li>
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-600' : 'bg-gray-400'}`} />
                      Al menos una letra mayúscula
                    </li>
                    <li className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-green-600' : 'bg-gray-400'}`} />
                      Al menos una letra minúscula
                    </li>
                    <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-green-600' : 'bg-gray-400'}`} />
                      Al menos un número
                    </li>
                  </ul>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme la contraseña"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: '' });
                      }
                    }}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Las contraseñas coinciden
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Registrar Empleado
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}