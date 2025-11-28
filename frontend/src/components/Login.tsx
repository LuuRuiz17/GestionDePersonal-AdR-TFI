import { useState } from 'react';
import { LogIn, Eye, EyeOff, User, Lock } from 'lucide-react';
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

interface LoginProps {
  onLogin: (dni: string, employeeName: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;


export function Login({ onLogin }: LoginProps) {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validar DNI
    if (!dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{7,8}$/.test(dni.trim())) {
      newErrors.dni = 'El DNI debe tener 7 u 8 dígitos';
    }

    // Validar contraseña
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    setIsLoading(true);

    // Realizar petición a la API
    fetch(API_BASE_URL + '/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dni: parseInt(dni),
        contrasena: password
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Guardar el JWT en localStorage
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('employee_complete_name', data.employee_complete_name || 'Usuario');
          localStorage.setItem('employee_dni', dni);
          
          // Console.log del rol para verificar
          console.log('Rol del usuario:', data.role);
          console.log('Datos del usuario:', data);
          
          // Login exitoso
          toast.success('¡Inicio de sesión exitoso!', {
            description: data.mensaje
          });

          onLogin(dni, data.employee_complete_name || 'Usuario');
        } else {
          // Error en el login
          toast.error('Error al iniciar sesión', {
            description: data.mensaje || data.error || 'Credenciales inválidas'
          });
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error al conectar con la API:', error);
        toast.error('Error de conexión', {
          description: 'No se pudo conectar con el servidor. Verifique su conexión.'
        });
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Sistema de Gestión de Personal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DNI */}
            <div className="space-y-2">
              <Label htmlFor="dni">
                DNI <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="dni"
                  type="text"
                  placeholder="Ingrese su DNI"
                  value={dni}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir solo números
                    if (value === '' || /^\d+$/.test(value)) {
                      setDni(value);
                      if (errors.dni) {
                        setErrors({ ...errors, dni: '' });
                      }
                    }
                  }}
                  className={`pl-10 ${errors.dni ? 'border-red-500' : ''}`}
                  maxLength={8}
                />
              </div>
              {errors.dni && (
                <p className="text-sm text-red-500">{errors.dni}</p>
              )}
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
                  placeholder="Ingrese su contraseña"
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
            </div>

            {/* Botón de inicio de sesión */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              Si es un nuevo empleado, solicite a un administrador que registre sus credenciales
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}