import { useState, useEffect } from 'react';
import { ArrowLeft, UserCog, Settings, Building2, Users, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

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

interface AssignSupervisorProps {
  onBack: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;


export function AssignSupervisor({ onBack }: AssignSupervisorProps) {
  const [sectors, setSectors] = useState<ApiSector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<ApiSector | null>(null);
  const [selectedSupervisorIds, setSelectedSupervisorIds] = useState<number[]>([]);

  // Cargar datos desde la API
  useEffect(() => {
    const fetchSupervisors = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      try {
        const response = await fetch(API_BASE_URL + '/api/supervisors/', {
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
        
        console.log('Respuesta completa de la API (GET supervisores):', data);

        if (data.sectores && Array.isArray(data.sectores)) {
          setSectors(data.sectores);
        }
      } catch (error) {
        console.error('Error al cargar supervisores:', error);
        toast.error('Error al cargar supervisores', {
          description: 'No se pudieron obtener los datos de supervisores'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupervisors();
  }, []);

  // Obtener todos los empleados de un sector (de todos los puestos)
  const getEmployeesFromSector = (sector: ApiSector): ApiEmployee[] => {
    const employees: ApiEmployee[] = [];
    sector.puestos.forEach(puesto => {
      employees.push(...puesto.empleados);
    });
    return employees;
  };

  // Obtener supervisores actuales de un sector
  const getSupervisorsFromSector = (sector: ApiSector): ApiEmployee[] => {
    const employees = getEmployeesFromSector(sector);
    return employees.filter(emp => emp.esSupervisorDeSector);
  };

  const handleOpenAssignDialog = (sector: ApiSector) => {
    setSelectedSector(sector);
    
    // Verificar si hay empleados en el sector
    const employeesInSector = getEmployeesFromSector(sector);
    if (employeesInSector.length === 0) {
      toast.error('No hay empleados en este sector', {
        description: 'No se pueden asignar supervisores porque no hay empleados disponibles en este sector.'
      });
      return;
    }

    // Cargar supervisores actuales del sector
    const currentSupervisors = getSupervisorsFromSector(sector);
    setSelectedSupervisorIds(currentSupervisors.map(sup => sup.id));
    
    setIsDialogOpen(true);
  };

  const handleToggleSupervisor = (employeeId: number) => {
    setSelectedSupervisorIds(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSaveSupervisors = async () => {
    if (!selectedSector) return;

    const token = localStorage.getItem('authToken');
    
    try {
      const requestBody = {
        idsSupervisores: selectedSupervisorIds
      };

      console.log('Enviando PUT a /api/supervisors/', selectedSector.id, 'con body:', requestBody);

      const response = await fetch(API_BASE_URL + `/api/supervisors/${selectedSector.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Respuesta completa de la API (PUT supervisores):', data);

      // Recargar los datos
      const reloadResponse = await fetch(API_BASE_URL + '/api/supervisors/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (reloadResponse.ok) {
        const reloadData = await reloadResponse.json();
        if (reloadData.sectores && Array.isArray(reloadData.sectores)) {
          setSectors(reloadData.sectores);
        }
      }

      toast.success('Supervisores actualizados', {
        description: 'Los supervisores del sector han sido actualizados correctamente'
      });

      setIsDialogOpen(false);
      setSelectedSector(null);
      setSelectedSupervisorIds([]);
    } catch (error) {
      console.error('Error al actualizar supervisores:', error);
      toast.error('Error al actualizar supervisores', {
        description: 'No se pudieron guardar los cambios'
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSector(null);
    setSelectedSupervisorIds([]);
  };

  const employeesInSelectedSector = selectedSector ? getEmployeesFromSector(selectedSector) : [];

  return (
    <div>
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
            <h2>Asignar Supervisores por Sector</h2>
            <p className="text-gray-600 text-sm mt-1">
              Gestione los supervisores de cada sector de la organización (múltiples supervisores por sector)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4 flex items-center gap-2 text-gray-700">
          <Building2 className="w-5 h-5" />
          <h3>Sectores y Supervisores</h3>
        </div>

        {/* Tabla de sectores con sus supervisores */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Sector</TableHead>
                <TableHead>Supervisores Actuales</TableHead>
                <TableHead>Empleados en el Sector</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-600">Cargando sectores...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sectors.length > 0 ? (
                sectors.map((sector) => {
                  const supervisors = getSupervisorsFromSector(sector);
                  const totalEmployeesInSector = getEmployeesFromSector(sector).length;

                  return (
                    <TableRow key={sector.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>{sector.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {supervisors.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {supervisors.map((supervisor) => {
                              // Encontrar el puesto del supervisor
                              let positionName = '';
                              sector.puestos.forEach(puesto => {
                                if (puesto.empleados.some(emp => emp.id === supervisor.id)) {
                                  positionName = puesto.nombre;
                                }
                              });
                              
                              return (
                                <Badge key={supervisor.id} variant="secondary" className="bg-purple-100 text-purple-800">
                                  <UserCog className="w-3 h-3 mr-1" />
                                  {supervisor.nombre} {supervisor.apellido}
                                  <span className="ml-1 text-xs text-purple-600">
                                    ({positionName})
                                  </span>
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Sin supervisores asignados</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>{totalEmployeesInSector} empleado(s)</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAssignDialog(sector)}
                          className="gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Gestionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No hay sectores disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCog className="w-4 h-4 text-purple-600" />
              <span>Supervisor de Sector</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Sector</span>
            </div>
          </div>
          <span>{sectors.length} sector(es)</span>
        </div>
      </div>

      {/* Diálogo para asignar supervisores a un sector */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Gestionar Supervisores del Sector {selectedSector?.nombre}</DialogTitle>
            <DialogDescription>
              Seleccione uno o más empleados del sector {selectedSector?.nombre} para asignarlos como supervisores
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {employeesInSelectedSector.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No hay empleados disponibles en el sector {selectedSector?.nombre} para asignar como supervisores.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {employeesInSelectedSector.length} empleado(s) en el sector
                    </span>
                  </div>
                  <div className="text-sm text-purple-700">
                    {selectedSupervisorIds.length} seleccionado(s) como supervisor(es)
                  </div>
                </div>

                <div className="space-y-2 max-h-[450px] overflow-y-auto border rounded-lg p-3">
                  {employeesInSelectedSector.map((emp) => {
                    // Encontrar el puesto del empleado
                    let positionName = '';
                    selectedSector?.puestos.forEach(puesto => {
                      if (puesto.empleados.some(e => e.id === emp.id)) {
                        positionName = puesto.nombre;
                      }
                    });

                    const isSelected = selectedSupervisorIds.includes(emp.id);

                    return (
                      <div
                        key={emp.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                          isSelected ? 'bg-purple-50 border-purple-300' : 'hover:bg-gray-50'
                        }`}
                      >
                        <Checkbox
                          id={String(emp.id)}
                          checked={isSelected}
                          onCheckedChange={() => handleToggleSupervisor(emp.id)}
                          className="mt-1"
                        />
                        <Label htmlFor={String(emp.id)} className="flex-1 cursor-pointer">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <UserCog className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                              <div>
                                <p className={isSelected ? 'text-purple-900' : 'text-gray-900'}>
                                  {emp.nombre} {emp.apellido}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {positionName} | DNI: {emp.dni}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {emp.correo}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <Badge className="bg-purple-600">
                                Seleccionado
                              </Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveSupervisors} 
              disabled={employeesInSelectedSector.length === 0}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}