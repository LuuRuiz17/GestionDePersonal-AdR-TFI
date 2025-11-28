import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Mail, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import type { Request, RequestType } from './GenerateRequest';

interface ManageRequestsProps {
  onBack: () => void;
}

export function ManageRequests({ onBack }: ManageRequestsProps) {
  // Simular supervisor logueado
  const currentSupervisor = {
    id: 'EMP001',
    name: 'Juan',
    lastName: 'Pérez',
  };

  // Empleados supervisados (en una app real vendría del backend)
  const supervisedEmployees = ['EMP004', 'EMP003', 'EMP008'];

  const [requests, setRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [sortByStatus, setSortByStatus] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Cargar solicitudes del localStorage
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No hay token de autenticación');
      return;
    }

    try {
      const response = await fetch('https://accompanied-adjusted-pray-association.trycloudflare.com/api/requests/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Respuesta de todas las solicitudes:', data);

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
        
        setRequests(mappedRequests);
      }
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      toast.error('Error al cargar las solicitudes');
    }
  };

  const getRequestTypeLabel = (type: RequestType): string => {
    const types = {
      vacation: 'Vacaciones',
      permission: 'Permiso',
      leave: 'Licencia',
    };
    return types[type] || type;
  };

  const getRequestTypeColor = (type: RequestType): string => {
    const colors = {
      vacation: 'bg-blue-100 text-blue-800',
      permission: 'bg-amber-100 text-amber-800',
      leave: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'approved':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'rejected':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return formatDate(dateString);
  };

  // Filtrar y ordenar solicitudes
  const filteredRequests = requests
    .filter(request => {
      // Filtro por estado
      if (statusFilter !== 'all' && request.status !== statusFilter) return false;

      // Filtro por búsqueda (nombre y apellido)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${request.employeeName} ${request.employeeLastName}`.toLowerCase();
        if (!fullName.includes(searchLower)) return false;
      }

      // Filtro por tipo
      if (typeFilter !== 'all' && request.type !== typeFilter) return false;

      // Filtro por fecha
      if (dateFilter) {
        const requestDate = new Date(request.date).toISOString().split('T')[0];
        if (requestDate !== dateFilter) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Si está activado el ordenamiento por estado
      if (sortByStatus) {
        const statusOrder = { pending: 1, approved: 2, rejected: 3 };
        const statusA = statusOrder[a.status as keyof typeof statusOrder] || 999;
        const statusB = statusOrder[b.status as keyof typeof statusOrder] || 999;
        return statusA - statusB;
      }
      
      // Ordenamiento por fecha
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
    setActionType(null);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No hay token de autenticación');
      return;
    }

    try {
      const response = await fetch(`https://accompanied-adjusted-pray-association.trycloudflare.com/api/requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "estado": 'ACEPTADO'
        }),
      });

      const data = await response.json();
      console.log('Respuesta de aprobación:', data);

      if (data.status === 'success' || response.ok) {
        // Actualizar estado localmente
        const updatedRequests = requests.map(req =>
          req.id === selectedRequest.id ? { ...req, status: 'approved' as const } : req
        );
        setRequests(updatedRequests);

        toast.success(
          `Solicitud aprobada exitosamente.`
        );

        setIsDialogOpen(false);
        setSelectedRequest(null);
        
        // Recargar solicitudes
        loadRequests();
      } else {
        toast.error('Error al aprobar la solicitud: ' + (data.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('No hay token de autenticación');
      return;
    }

    try {
      const response = await fetch(`https://accompanied-adjusted-pray-association.trycloudflare.com/api/requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'RECHAZADO'
        }),
      });

      const data = await response.json();
      console.log('Respuesta de rechazo:', data);

      if (data.status === 'success' || response.ok) {
        // Actualizar estado localmente
        const updatedRequests = requests.map(req =>
          req.id === selectedRequest.id ? { ...req, status: 'rejected' as const } : req
        );
        setRequests(updatedRequests);

        toast.error(
          `Solicitud rechazada.`
        );

        setIsDialogOpen(false);
        setSelectedRequest(null);
        
        // Recargar solicitudes
        loadRequests();
      } else {
        toast.error('Error al rechazar la solicitud: ' + (data.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      toast.error('Error al conectar con el servidor');
    }
  };

  const confirmAction = (action: 'approve' | 'reject') => {
    setActionType(action);
  };

  const cancelAction = () => {
    setActionType(null);
  };

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
            <h2>Gestionar Solicitudes</h2>
            <p className="text-gray-600 text-sm mt-1">
              Revise y apruebe o rechace solicitudes de sus empleados
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 mb-3">
            <Filter className="w-4 h-4" />
            <span>Filtros de Búsqueda</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda por nombre */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Buscar por Nombre
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Nombre y apellido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Tipo de Solicitud
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="vacation">Vacaciones</SelectItem>
                  <SelectItem value="permission">Permiso</SelectItem>
                  <SelectItem value="leave">Licencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Estado
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por fecha */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Fecha
              </label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Segunda fila de filtros - Ordenamiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ordenamiento por fecha */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Ordenar por Fecha
              </label>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
                  setSortByStatus(false);
                }}
              >
                <span>{sortOrder === 'newest' ? 'Más recientes' : 'Más antiguas'}</span>
                {sortOrder === 'newest' ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Ordenamiento por estado */}
            <div>
              <label className="block text-sm mb-2 text-gray-700">
                Ordenar por Estado
              </label>
              <Button
                variant={sortByStatus ? "default" : "outline"}
                className="w-full justify-between"
                onClick={() => setSortByStatus(!sortByStatus)}
              >
                <span>Pendientes primero</span>
                {sortByStatus && <CheckCircle2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla de solicitudes */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>ID</TableHead>
                <TableHead>Empleado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <TableRow key={request.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>{request.id}</TableCell>
                    <TableCell>
                      <div>
                        <p>
                          {request.employeeName} {request.employeeLastName}
                        </p>
                        <p className="text-sm text-gray-500">DNI: {request.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getRequestTypeColor(request.type)}`}>
                        {getRequestTypeLabel(request.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`inline-flex items-center gap-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(request.date)}</p>
                        <p className="text-xs text-gray-500">{getRelativeDate(request.date)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{request.duration} día{request.duration > 1 ? 's' : ''}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRequest(request)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {requests.length === 0
                      ? 'No hay solicitudes'
                      : 'No se encontraron solicitudes con los criterios de búsqueda'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Información adicional */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {filteredRequests.length} de {requests.length} solicitud(es)
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Badge className="bg-yellow-100 text-yellow-800">
                <Clock className="w-3 h-3 mr-1" />
                Pendientes: {requests.filter(r => r.status === 'pending').length}
              </Badge>
            </span>
            <span className="flex items-center gap-1">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Aprobadas: {requests.filter(r => r.status === 'approved').length}
              </Badge>
            </span>
            <span className="flex items-center gap-1">
              <Badge className="bg-red-100 text-red-800">
                <XCircle className="w-3 h-3 mr-1" />
                Rechazadas: {requests.filter(r => r.status === 'rejected').length}
              </Badge>
            </span>
          </div>
        </div>
      </div>

      {/* Diálogo de detalles de solicitud */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedRequest && !actionType && (
            <>
              <DialogHeader>
                <DialogTitle>Detalles de la Solicitud</DialogTitle>
                <DialogDescription>
                  {selectedRequest.status === 'pending' 
                    ? 'Revise la información y apruebe o rechace la solicitud'
                    : 'Información de la solicitud'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Información del empleado */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Empleado</p>
                        <p>
                          {selectedRequest.employeeName} {selectedRequest.employeeLastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">DNI</p>
                        <p>{selectedRequest.employeeId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detalles de la solicitud */}
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tipo de Solicitud</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${getRequestTypeColor(selectedRequest.type)}`}>
                          {getRequestTypeLabel(selectedRequest.type)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Estado</p>
                        <Badge className={`inline-flex items-center gap-1 ${getStatusColor(selectedRequest.status)}`}>
                          {getStatusIcon(selectedRequest.status)}
                          {getStatusLabel(selectedRequest.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Duración</p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {selectedRequest.duration} día{selectedRequest.duration > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Fecha de Solicitud</p>
                        <p>{formatDate(selectedRequest.date)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Motivo</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm">{selectedRequest.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cerrar
                </Button>
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => confirmAction('reject')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                    <Button onClick={() => confirmAction('approve')}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Aprobar
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}

          {selectedRequest && actionType === 'approve' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmar Aprobación
                </DialogTitle>
                <DialogDescription>
                  ¿Está seguro que desea aprobar esta solicitud?
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Se aprobará la solicitud de{' '}
                    <span>
                      <strong>{getRequestTypeLabel(selectedRequest.type).toLowerCase()}</strong>
                    </span>{' '}
                    de <strong>{selectedRequest.employeeName} {selectedRequest.employeeLastName}</strong> por{' '}
                    <strong>{selectedRequest.duration} día{selectedRequest.duration > 1 ? 's' : ''}</strong>.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={cancelAction}>
                  Cancelar
                </Button>
                <Button onClick={handleApproveRequest}>
                  Confirmar Aprobación
                </Button>
              </DialogFooter>
            </>
          )}

          {selectedRequest && actionType === 'reject' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  Confirmar Rechazo
                </DialogTitle>
                <DialogDescription>
                  ¿Está seguro que desea rechazar esta solicitud?
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Se rechazará la solicitud de{' '}
                    <span>
                      <strong>{getRequestTypeLabel(selectedRequest.type).toLowerCase()}</strong>
                    </span>{' '}
                    de <strong>{selectedRequest.employeeName} {selectedRequest.employeeLastName}</strong>.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={cancelAction}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleRejectRequest}>
                  Confirmar Rechazo
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}