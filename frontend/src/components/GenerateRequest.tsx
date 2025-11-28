import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Calendar, Clock, Plus, Eye, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
import { toast } from 'sonner@2.0.3';

interface GenerateRequestProps {
  onBack: () => void;
}

export type RequestType = 'vacation' | 'permission' | 'leave';

export interface Request {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeLastName: string;
  type: RequestType;
  duration: number;
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

type ViewMode = 'list' | 'form' | 'success';

export function GenerateRequest({ onBack }: GenerateRequestProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [requestType, setRequestType] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [myRequests, setMyRequests] = useState<Request[]>([]);

  // Simular empleado logueado
  const currentEmployee = {
    id: 'EMP004',
    name: 'Ana',
    lastName: 'Martínez',
  };

  const requestTypes = [
    { value: 'vacation', label: 'Vacaciones', icon: '🏖️' },
    { value: 'permission', label: 'Permiso', icon: '📋' },
    { value: 'leave', label: 'Licencia', icon: '🏥' },
  ];

  // Cargar solicitudes del empleado actual
  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No hay token de autenticación');
      return;
    }

    try {
      const response = await fetch('https://accompanied-adjusted-pray-association.trycloudflare.com/api/requests/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Respuesta de solicitudes:', data);

      if (data.status === 'success' && data.solicitudes) {
        // Mapear las solicitudes del backend al formato del frontend
        const mappedRequests: Request[] = data.solicitudes.map((sol: any) => ({
          id: sol.id.toString(),
          employeeId: sol.empleado.id.toString(),
          employeeName: sol.empleado.nombre,
          employeeLastName: sol.empleado.apellido,
          type: sol.tipoSolicitud === 'VACACIONES' ? 'vacation' : sol.tipoSolicitud === 'PERMISO' ? 'permission' : 'leave',
          duration: sol.duracionDias,
          reason: sol.motivo,
          date: new Date().toISOString(), // No viene en la respuesta, usar fecha actual
          status: sol.estadoSolicitud === 'PENDIENTE' ? 'pending' : sol.estadoSolicitud === 'ACEPTADO' ? 'approved' : 'rejected',
        }));
        
        setMyRequests(mappedRequests);
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      toast.error('Error al cargar las solicitudes');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validar tipo de solicitud
    if (!requestType) {
      newErrors.requestType = 'Debe seleccionar un tipo de solicitud';
    }

    // Validar duración
    if (!duration) {
      newErrors.duration = 'La duración es obligatoria';
    } else {
      const durationNum = parseFloat(duration);
      if (isNaN(durationNum)) {
        newErrors.duration = 'La duración debe ser un número válido';
      } else if (durationNum <= 0) {
        newErrors.duration = 'La duración debe ser mayor a 0';
      } else if (durationNum > 365) {
        newErrors.duration = 'La duración no puede exceder 365 días';
      } else if (!Number.isInteger(durationNum)) {
        newErrors.duration = 'La duración debe ser un número entero';
      }
    }

    // Validar motivo
    if (!reason.trim()) {
      newErrors.reason = 'El motivo es obligatorio';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'El motivo debe tener al menos 10 caracteres';
    } else if (reason.trim().length > 500) {
      newErrors.reason = 'El motivo no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo números enteros positivos
    if (value === '' || /^\d+$/.test(value)) {
      setDuration(value);
      if (errors.duration) {
        setErrors({ ...errors, duration: '' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No hay token de autenticación');
      return;
    }

    // Mapear el tipo de solicitud al formato del backend
    const tipoSolicitudBackend = requestType === 'vacation' ? 'VACACIONES' : requestType === 'permission' ? 'PERMISO' : 'LICENCIA';

    // Necesitamos el ID del empleado desde localStorage o alguna fuente
    // Por ahora usar un ID de prueba, idealmente debería venir del login
    const employeeId = 3; // Este debería venir del usuario logueado

    const requestData = {
      tipoSolicitud: tipoSolicitudBackend,
      duracionDias: parseInt(duration),
      motivo: reason.trim(),
      empleado: {
        id: employeeId
      }
    };

    console.log('Enviando solicitud a la API:', requestData);

    try {
      const response = await fetch('https://accompanied-adjusted-pray-association.trycloudflare.com/api/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Respuesta de creación de solicitud:', data);

      if (data.status === 'success' || response.ok) {
        // Mostrar éxito
        setViewMode('success');
        toast.success('¡Solicitud generada exitosamente!');

        // Recargar solicitudes y volver al listado después de 3 segundos
        setTimeout(() => {
          setRequestType('');
          setDuration('');
          setReason('');
          loadMyRequests();
          setViewMode('list');
        }, 3000);
      } else {
        toast.error('Error al crear la solicitud: ' + (data.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const getRequestTypeLabel = (type: string): string => {
    const found = requestTypes.find(rt => rt.value === type);
    return found ? found.label : '';
  };

  const getRequestTypeIcon = (type: string): string => {
    const found = requestTypes.find(rt => rt.value === type);
    return found ? found.icon : '';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
    }
  };

  // Vista de éxito
  if (viewMode === 'success') {
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
            <h2>Generar Solicitud</h2>
            <p className="text-gray-600 text-sm mt-1">
              Gestione sus solicitudes de vacaciones, permisos o licencias
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-green-600 mb-2">¡Solicitud Generada Exitosamente!</h3>
                  <p className="text-gray-600">
                    Su solicitud de {getRequestTypeLabel(requestType).toLowerCase()} ha sido enviada
                    y está pendiente de aprobación.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg w-full text-left space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">Tipo:</span>{' '}
                    <span>{getRequestTypeLabel(requestType)}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Duración:</span>{' '}
                    <span>{duration} día(s)</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Estado:</span>{' '}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      Pendiente
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista del formulario
  if (viewMode === 'form') {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Listado
            </Button>
            <div>
              <h2>Nueva Solicitud</h2>
              <p className="text-gray-600 text-sm mt-1">
                Complete el formulario para generar su solicitud
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Nueva Solicitud
              </CardTitle>
              <CardDescription>
                Complete el formulario para generar su solicitud. Un supervisor revisará y aprobará su solicitud.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información del empleado */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Solicitante</p>
                  <p>
                    {currentEmployee.name} {currentEmployee.lastName}
                  </p>
                  <p className="text-sm text-gray-500">DNI: {currentEmployee.id}</p>
                </div>

                {/* Tipo de solicitud */}
                <div className="space-y-2">
                  <Label htmlFor="requestType">
                    Tipo de Solicitud <span className="text-red-500">*</span>
                  </Label>
                  <Select value={requestType} onValueChange={(value) => {
                    setRequestType(value);
                    if (errors.requestType) {
                      setErrors({ ...errors, requestType: '' });
                    }
                  }}>
                    <SelectTrigger id="requestType" className={errors.requestType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccione el tipo de solicitud" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.requestType && (
                    <p className="text-sm text-red-500">{errors.requestType}</p>
                  )}
                </div>

                {/* Duración */}
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duración (días) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="duration"
                      type="text"
                      placeholder="Ej: 5"
                      value={duration}
                      onChange={handleDurationChange}
                      className={`pl-10 ${errors.duration ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.duration && (
                    <p className="text-sm text-red-500">{errors.duration}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Ingrese la cantidad de días que durará su solicitud
                  </p>
                </div>

                {/* Motivo */}
                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Motivo de la Solicitud <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Describa el motivo de su solicitud..."
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (errors.reason) {
                        setErrors({ ...errors, reason: '' });
                      }
                    }}
                    className={`min-h-[120px] ${errors.reason ? 'border-red-500' : ''}`}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-500">{errors.reason}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {reason.length}/500 caracteres (mínimo 10)
                  </p>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setViewMode('list')}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <FileText className="w-4 h-4 mr-2" />
                    Generar Solicitud
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista del listado (por defecto)
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
            <h2>Mis Solicitudes</h2>
            <p className="text-gray-600 text-sm mt-1">
              Gestione sus solicitudes de vacaciones, permisos o licencias
            </p>
          </div>
        </div>
        <Button onClick={() => setViewMode('form')} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Solicitud
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Información del empleado */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Empleado</p>
              <p className="text-lg">
                {currentEmployee.name} {currentEmployee.lastName}
              </p>
              <p className="text-sm text-gray-500">DNI: {currentEmployee.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Total de Solicitudes</p>
              <p className="text-2xl">{myRequests.length}</p>
            </div>
          </div>
        </div>

        {/* Resumen por estado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                  <p className="text-2xl">
                    {myRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aprobadas</p>
                  <p className="text-2xl">
                    {myRequests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rechazadas</p>
                  <p className="text-2xl">
                    {myRequests.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de solicitudes */}
        <div>
          <h3 className="mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Historial de Solicitudes
          </h3>
          {myRequests.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myRequests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">{request.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getRequestTypeIcon(request.type)}</span>
                          <span>{getRequestTypeLabel(request.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{request.duration} día(s)</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(request.date)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border border-dashed rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">No hay solicitudes</h3>
              <p className="text-gray-500 mb-4">
                Aún no has generado ninguna solicitud
              </p>
              <Button onClick={() => setViewMode('form')} className="gap-2">
                <Plus className="w-4 h-4" />
                Crear Primera Solicitud
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}