import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Calendar, UserCheck, AlertCircle, History } from 'lucide-react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';

interface RegisterAttendanceProps {
  onBack: () => void;
}

export interface Attendance {
  id: string;
  date: string; // Fecha en formato YYYY-MM-DD
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export function RegisterAttendance({ onBack }: RegisterAttendanceProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [myAttendances, setMyAttendances] = useState<Attendance[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Obtener datos del empleado logueado desde localStorage
  const getEmployeeData = () => {
    const employeeName = localStorage.getItem('employee_complete_name') || 'Usuario';
    const employeeDni = localStorage.getItem('employee_dni') || '';
    
    return {
      name: employeeName,
      dni: employeeDni,
    };
  };

  const currentEmployee = getEmployeeData();

  // Actualizar fecha/hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cargar asistencias del empleado
  useEffect(() => {
    loadMyAttendances();
  }, []);

  const loadMyAttendances = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No hay token de autenticación');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_BASE_URL + '/api/attendance/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Respuesta de asistencias:', data);

      if (response.ok && data.asistencias) {
        // Mapear las asistencias del backend al formato del frontend
        const mappedAttendances: Attendance[] = data.asistencias.map((att: any) => ({
          id: att.id.toString(),
          date: att.fecha, // Ya viene en formato YYYY-MM-DD
        }));
        
        setMyAttendances(mappedAttendances);

        // Verificar si ya hay asistencia registrada hoy
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const attendanceToday = mappedAttendances.find(att => att.date === todayStr);
        setTodayAttendance(attendanceToday || null);
      }
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
      toast.error('Error al cargar las asistencias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    if (todayAttendance) {
      toast.error('Ya registró su asistencia hoy', {
        description: `Su asistencia fue registrada el ${formatDate(todayAttendance.date)}`
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleConfirmAttendance = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No hay token de autenticación');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_BASE_URL + '/api/attendance/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Body vacío
      });

      const data = await response.json();
      console.log('Respuesta de registro de asistencia:', data);

      if (response.ok && data.status === 'success') {
        setIsDialogOpen(false);
        toast.success('¡Asistencia registrada exitosamente!', {
          description: `Fecha: ${formatDate(new Date().toISOString())}`
        });

        // Recargar asistencias
        loadMyAttendances();
      } else {
        // Manejar error (ej: ya registró asistencia)
        setIsDialogOpen(false);
        toast.error(data.mensaje || 'Error al registrar asistencia', {
          description: data.status === 'error' ? 'Intente nuevamente' : ''
        });
        
        // Recargar por si el estado cambió
        loadMyAttendances();
      }
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      setIsDialogOpen(false);
      toast.error('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDateTime = (dateString: string): string => {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  };

  const formatCurrentDateTime = (): string => {
    return currentDateTime.toLocaleString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getDayOfWeek = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { weekday: 'long' });
  };

  const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  };

  // Obtener estadísticas del mes actual
  const getMonthStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthAttendances = myAttendances.filter(att => {
      const attDate = new Date(att.date);
      return attDate.getMonth() === currentMonth && attDate.getFullYear() === currentYear;
    });

    return monthAttendances.length;
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Menú
        </Button>
        <div>
          <h2>Registrar Asistencia</h2>
          <p className="text-gray-600 text-sm mt-1">
            Marque su asistencia diaria
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tarjeta principal de registro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Registrar Asistencia
            </CardTitle>
            <CardDescription>
              Confirme su presencia para el día de hoy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Información del empleado */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Empleado</p>
              <p className="text-lg">
                {currentEmployee.name}
              </p>
              <p className="text-sm text-gray-500">DNI: {currentEmployee.dni}</p>
            </div>

            {/* Fecha y hora actual */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-indigo-900">Fecha y Hora Actual</h3>
              </div>
              <p className="text-2xl text-indigo-900 capitalize">
                {formatCurrentDateTime()}
              </p>
            </div>

            {/* Estado de asistencia de hoy */}
            {todayAttendance ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Asistencia ya registrada hoy</strong>
                  <br />
                  Registrado el {formatDate(todayAttendance.date)}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No ha registrado su asistencia para el día de hoy. Presione el botón para registrar.
                </AlertDescription>
              </Alert>
            )}

            {/* Botón de registro */}
            <Button
              onClick={handleOpenDialog}
              disabled={todayAttendance !== null || isLoading}
              size="lg"
              className="w-full h-16 text-lg"
            >
              <UserCheck className="w-6 h-6 mr-2" />
              {isLoading ? 'Procesando...' : todayAttendance ? 'Asistencia Registrada' : 'Registrar Mi Asistencia'}
            </Button>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Asistencias este mes</p>
                  <p className="text-3xl">{getMonthStats()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de asistencias</p>
                  <p className="text-3xl">{myAttendances.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historial de asistencias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial de Asistencias
            </CardTitle>
            <CardDescription>
              Últimas 10 asistencias registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="border border-dashed rounded-lg p-12 text-center">
                <p className="text-gray-500">Cargando asistencias...</p>
              </div>
            ) : myAttendances.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Día</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myAttendances
                      .sort((a, b) => {
                        // Ordenar por fecha descendente (más reciente primero)
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                      })
                      .slice(0, 10)
                      .map((attendance) => (
                        <TableRow key={attendance.id}>
                          <TableCell className="font-mono text-sm">
                            {attendance.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(attendance.date)}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {getDayOfWeek(attendance.date)}
                          </TableCell>
                          <TableCell>
                            {isToday(attendance.date) ? (
                              <Badge className="bg-green-600">Hoy</Badge>
                            ) : (
                              <Badge variant="secondary">Registrado</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-12 text-center">
                <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">Sin registros de asistencia</h3>
                <p className="text-gray-500">
                  No hay asistencias registradas aún
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Confirmar Registro de Asistencia
            </DialogTitle>
            <DialogDescription>
              ¿Confirma que desea registrar su asistencia para el día de hoy?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Empleado:</span>
                <span className="text-sm">
                  {currentEmployee.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">DNI:</span>
                <span className="text-sm font-mono">{currentEmployee.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fecha:</span>
                <span className="text-sm">{formatDate(currentDateTime.toISOString())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hora:</span>
                <span className="text-sm">{formatTime(currentDateTime.toISOString())}</span>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Al confirmar, se registrará su asistencia con la fecha y hora actual.
                Esta acción solo puede realizarse una vez por día.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmAttendance}
              disabled={isLoading}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isLoading ? 'Registrando...' : 'Confirmar Asistencia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}