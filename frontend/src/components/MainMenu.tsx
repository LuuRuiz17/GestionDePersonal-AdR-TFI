import { Users, Briefcase, Building2, UserCog, Calendar, ClipboardList, DollarSign, BarChart3, FileText, Lock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import type { ViewType } from '../App';
import { useState, useEffect } from 'react';

interface MainMenuProps {
  onNavigate: (view: ViewType) => void;
}

interface MenuOption {
  id: ViewType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  allowedRoles: string[]; // Roles que pueden acceder a esta opción
}

type UserRole = 'ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';

export function MainMenu({ onNavigate }: MainMenuProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Obtener el rol del usuario desde localStorage
    const role = localStorage.getItem('userRole') as UserRole;
    setUserRole(role);
  }, []);

  const menuOptions: MenuOption[] = [
    {
      id: 'manage-employees',
      title: 'Gestionar Empleados',
      description: 'Agregar, editar y eliminar empleados',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-blue-600',
      allowedRoles: ['ADMIN'],
    },
    {
      id: 'manage-positions',
      title: 'Gestionar Puestos',
      description: 'Administrar puestos de trabajo',
      icon: <Briefcase className="w-8 h-8" />,
      color: 'bg-teal-600',
      allowedRoles: ['ADMIN'],
    },
    {
      id: 'consult-sector',
      title: 'Consultar Sector',
      description: 'Ver información de sectores',
      icon: <Building2 className="w-8 h-8" />,
      color: 'bg-purple-600',
      allowedRoles: ['SUPERVISOR', 'EMPLOYEE'],
    },
    {
      id: 'assign-supervisor',
      title: 'Asignar Supervisor',
      description: 'Asignar supervisores a empleados',
      icon: <UserCog className="w-8 h-8" />,
      color: 'bg-blue-500',
      allowedRoles: ['ADMIN'],
    },
    {
      id: 'register-attendance',
      title: 'Registrar Asistencia',
      description: 'Registrar entradas y salidas',
      icon: <Calendar className="w-8 h-8" />,
      color: 'bg-green-600',
      allowedRoles: ['SUPERVISOR', 'EMPLOYEE'],
    },
    {
      id: 'generate-request',
      title: 'Generar Solicitud',
      description: 'Crear nuevas solicitudes',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-orange-600',
      allowedRoles: ['EMPLOYEE'],
    },
    {
      id: 'manage-requests',
      title: 'Gestionar Solicitud',
      description: 'Aprobar o rechazar solicitudes',
      icon: <ClipboardList className="w-8 h-8" />,
      color: 'bg-red-600',
      allowedRoles: ['SUPERVISOR'],
    },
    {
      id: 'calculate-salaries',
      title: 'Calcular Sueldos',
      description: 'Procesar nóminas y salarios',
      icon: <DollarSign className="w-8 h-8" />,
      color: 'bg-amber-700',
      allowedRoles: ['SUPERVISOR'],
    },
    {
      id: 'generate-reports',
      title: 'Generar Reporte',
      description: 'Crear reportes y estadísticas',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'bg-slate-600',
      allowedRoles: ['ADMIN'],
    },
  ];

  // Separar opciones permitidas y bloqueadas
  const allowedOptions = menuOptions.filter((option) =>
    userRole ? option.allowedRoles.includes(userRole) : false
  );

  const blockedOptions = menuOptions.filter((option) =>
    userRole ? !option.allowedRoles.includes(userRole) : true
  );

  // Función para determinar si una opción está habilitada
  const isOptionEnabled = (option: MenuOption): boolean => {
    if (!userRole) return false;
    return option.allowedRoles.includes(userRole);
  };

  const getRoleName = (role: UserRole | null): string => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'SUPERVISOR':
        return 'Supervisor';
      case 'EMPLOYEE':
        return 'Empleado';
      default:
        return 'Usuario';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2>Menú Principal</h2>
            <p className="text-gray-600 mt-2">Seleccione una opción para comenzar</p>
          </div>
          {userRole && (
            <Badge variant="secondary" className="text-sm px-4 py-2">
              Rol: {getRoleName(userRole)}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Opciones habilitadas primero */}
        {allowedOptions.map((option) => (
          <Card
            key={option.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white border-2 border-green-200"
            onClick={() => onNavigate(option.id)}
          >
            <CardContent className="flex flex-col items-center text-center p-8 relative">
              <div className={`${option.color} text-white p-5 rounded-2xl mb-4 shadow-md`}>
                {option.icon}
              </div>
              <h3 className="mb-2">{option.title}</h3>
              <p className="text-gray-600 text-sm">{option.description}</p>
              <Badge className="absolute top-3 right-3 bg-green-500 text-white text-xs">
                Disponible
              </Badge>
            </CardContent>
          </Card>
        ))}

        {/* Opciones bloqueadas después, difuminadas */}
        {blockedOptions.map((option) => (
          <Card
            key={option.id}
            className="cursor-not-allowed opacity-50 bg-gray-100 border-2 border-gray-300"
          >
            <CardContent className="flex flex-col items-center text-center p-8 relative">
              <div className={`${option.color} text-white p-5 rounded-2xl mb-4 shadow-md opacity-60`}>
                {option.icon}
              </div>
              <h3 className="mb-2 text-gray-500">{option.title}</h3>
              <p className="text-gray-400 text-sm">{option.description}</p>
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                <Lock className="w-3 h-3" />
                <span>Bloqueado</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}