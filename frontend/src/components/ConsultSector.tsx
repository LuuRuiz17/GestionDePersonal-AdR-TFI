import { useState, useEffect } from 'react';
import { ArrowLeft, Search, User, Mail, Phone, MapPin, Calendar, Briefcase, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { toast } from 'sonner';

// Interfaces para los datos de la API
interface ApiEmployee {
  id: number;
  apellido: string;
  nombre: string;
  dni: number;
  correo: string;
  domicilio: string;
  fechaNacimiento: string;
  fechaContratacion: string;
  telefono: string;
  esSupervisorDeSector: boolean;
  supervisor: ApiEmployee | null;
}

interface ApiPosition {
  id: number;
  nombre: string;
  empleados: ApiEmployee[];
}

interface ApiSector {
  id: number;
  nombre: string;
  puestos: ApiPosition[];
}

interface ConsultSectorProps {
  onBack: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export function ConsultSector({ onBack }: ConsultSectorProps) {
  const [sectors, setSectors] = useState<ApiSector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<ApiEmployee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos desde la API
  useEffect(() => {
    const fetchSectors = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      try {
        const response = await fetch(API_BASE_URL + '/api/sectors/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('Respuesta completa de la API (GET sectores):', data);

        if (data.sectores && Array.isArray(data.sectores)) {
          setSectors(data.sectores);
        }
      } catch (error) {
        console.error('Error al cargar sectores:', error);
        toast.error('Error al cargar sectores', {
          description: 'No se pudieron obtener los datos de sectores'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectors();
  }, []);

  // Obtener todos los empleados de todos los sectores
  const getAllEmployees = (): ApiEmployee[] => {
    const employees: ApiEmployee[] = [];
    sectors.forEach(sector => {
      sector.puestos.forEach(puesto => {
        employees.push(...puesto.empleados);
      });
    });
    return employees;
  };

  // Obtener empleados de un sector específico
  const getEmployeesBySector = (sectorName: string): ApiEmployee[] => {
    const sector = sectors.find(s => s.nombre === sectorName);
    if (!sector) return [];
    
    const employees: ApiEmployee[] = [];
    sector.puestos.forEach(puesto => {
      employees.push(...puesto.empleados);
    });
    return employees;
  };

  // Obtener nombre del puesto de un empleado
  const getEmployeePosition = (employee: ApiEmployee): string => {
    for (const sector of sectors) {
      for (const puesto of sector.puestos) {
        if (puesto.empleados.some(emp => emp.id === employee.id)) {
          return puesto.nombre;
        }
      }
    }
    return 'N/A';
  };

  // Obtener nombre del sector de un empleado
  const getEmployeeSector = (employee: ApiEmployee): string => {
    for (const sector of sectors) {
      for (const puesto of sector.puestos) {
        if (puesto.empleados.some(emp => emp.id === employee.id)) {
          return sector.nombre;
        }
      }
    }
    return 'N/A';
  };

  // Filtrar empleados por sector y búsqueda
  const getFilteredEmployees = (): ApiEmployee[] => {
    let employees = selectedSector === 'all' ? getAllEmployees() : getEmployeesBySector(selectedSector);

    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      employees = employees.filter(employee => {
        const fullName = `${employee.nombre} ${employee.apellido}`.toLowerCase();
        return (
          String(employee.dni).includes(searchTerm) ||
          fullName.includes(searchLower)
        );
      });
    }

    return employees;
  };

  const filteredEmployees = getFilteredEmployees();

  // Separar supervisores y empleados regulares
  const supervisorsList = filteredEmployees.filter(e => e.esSupervisorDeSector);
  const regularEmployees = filteredEmployees.filter(e => !e.esSupervisorDeSector);

  const handleEmployeeClick = (employee: ApiEmployee) => {
    setSelectedEmployee(employee);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Menú
          </Button>
          <div>
            <h2>Consultar Sector</h2>
            <p className="text-gray-600 text-sm mt-1">
              Visualice empleados y supervisores por sector
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Panel izquierdo - Lista de empleados */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6 overflow-hidden flex flex-col">
          {/* Filtros */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Seleccionar Sector
              </label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los sectores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector.id} value={sector.nombre}>
                      {sector.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Buscar Empleado
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por DNI o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Lista de empleados */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">Cargando empleados...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Supervisores */}
                {supervisorsList.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm mb-3 text-purple-700">
                      Supervisores ({supervisorsList.length})
                    </h3>
                    <div className="space-y-2">
                      {supervisorsList.map(employee => {
                        const position = getEmployeePosition(employee);
                        const isSelected = selectedEmployee?.id === employee.id;
                        return (
                          <Card
                            key={employee.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? 'border-purple-500 border-2 bg-purple-50' : 'hover:border-purple-300'
                            }`}
                            onClick={() => handleEmployeeClick(employee)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-gray-900">
                                      {employee.nombre} {employee.apellido}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {position} - DNI: {employee.dni}
                                    </p>
                                  </div>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                                  Supervisor
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empleados regulares */}
                {regularEmployees.length > 0 && (
                  <div>
                    <h3 className="text-sm mb-3 text-blue-700">
                      Empleados ({regularEmployees.length})
                    </h3>
                    <div className="space-y-2">
                      {regularEmployees.map(employee => {
                        const position = getEmployeePosition(employee);
                        const isSelected = selectedEmployee?.id === employee.id;
                        return (
                          <Card
                            key={employee.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? 'border-blue-500 border-2 bg-blue-50' : 'hover:border-blue-300'
                            }`}
                            onClick={() => handleEmployeeClick(employee)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                  <User className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-gray-900">
                                    {employee.nombre} {employee.apellido}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {position} - DNI: {employee.dni}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredEmployees.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <User className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-center">
                      {selectedSector !== 'all'
                        ? `No hay empleados en el sector "${selectedSector}"`
                        : 'No hay empleados disponibles'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Panel derecho - Detalles del empleado */}
        {selectedEmployee ? (
          <div className="w-96 bg-white rounded-lg shadow-sm p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-gray-900">Detalles del Empleado</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Avatar y nombre */}
              <div className="flex flex-col items-center pb-6 border-b">
                <div className={`w-20 h-20 rounded-full ${
                  selectedEmployee.esSupervisorDeSector ? 'bg-purple-600' : 'bg-blue-600'
                } text-white flex items-center justify-center mb-3`}>
                  <User className="w-10 h-10" />
                </div>
                <h3 className="text-gray-900 text-center">
                  {selectedEmployee.nombre} {selectedEmployee.apellido}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  DNI: {selectedEmployee.dni}
                </p>
                {selectedEmployee.esSupervisorDeSector && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 mt-2">
                    Supervisor
                  </span>
                )}
              </div>

              {/* Información de contacto */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Correo Electrónico</p>
                    <p className="text-gray-900">{selectedEmployee.correo}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="text-gray-900">{selectedEmployee.telefono}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Domicilio</p>
                    <p className="text-gray-900">{selectedEmployee.domicilio}</p>
                  </div>
                </div>
              </div>

              {/* Información personal */}
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">DNI</p>
                    <p className="text-gray-900">{selectedEmployee.dni}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                    <p className="text-gray-900">{formatDate(selectedEmployee.fechaNacimiento)}</p>
                  </div>
                </div>
              </div>

              {/* Información laboral */}
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Puesto</p>
                    <p className="text-gray-900">
                      {getEmployeePosition(selectedEmployee)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Sector</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                      {getEmployeeSector(selectedEmployee)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Contratación</p>
                    <p className="text-gray-900">{formatDate(selectedEmployee.fechaContratacion)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-96 bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-gray-500">
            <User className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-center">
              Seleccione un empleado de la lista para ver sus detalles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}