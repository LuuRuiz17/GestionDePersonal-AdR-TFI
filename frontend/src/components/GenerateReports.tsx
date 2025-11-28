import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Building2,
  Briefcase,
  DollarSign,
  BarChart3,
  Loader2,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";

interface GenerateReportsProps {
  onBack: () => void;
}

interface Sector {
  id: number;
  nombre: string;
}

interface Position {
  id: number;
  nombre: string;
  sector: Sector;
  valorHora: number;
  horasMinimasTrabajoDiario: number;
}

interface Employee {
  id: number;
  apellido: string;
  nombre: string;
  dni: number;
  correo: string;
  domicilio: string;
  fechaNacimiento: string;
  fechaContratacion: string;
  telefono: string;
  puesto: Position;
  esSupervisorSector?: boolean;
}

interface Attendance {
  id: number;
  fecha: string;
}

interface EmployeeHistoryEntry {
  id: number;
  nombreCompleto: string;
  dni: number;
  nombrePuesto: string;
  nombreSector: string;
  fechaIngreso: string;
  fechaSalida: string;
}

interface EmployeeReportData {
  employee: Employee;
  attendanceCount: number;
  salary: number;
  attendancePercentage: number;
  role: string;
  history: EmployeeHistoryEntry[];
}

interface PositionReportData {
  position: Position;
  totalCost: number;
  employeeCount: number;
}

interface SectorReportData {
  sector: Sector;
  totalCost: number;
  positions: PositionReportData[];
  employeeCount: number;
}

interface SupervisorReportData {
  supervisor: Employee;
  employeesUnderSupervision: number;
  sector: Sector;
  position: Position;
}

const API_BASE_URL = "https://accompanied-adjusted-pray-association.trycloudflare.com";

export function GenerateReports({ onBack }: GenerateReportsProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<number>>(
    new Set(),
  );

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeReportData, setEmployeeReportData] = useState<
    EmployeeReportData[]
  >([]);
  const [sectorReportData, setSectorReportData] = useState<SectorReportData[]>(
    [],
  );
  const [supervisorReportData, setSupervisorReportData] = useState<
    SupervisorReportData[]
  >([]);

  const token = localStorage.getItem("authToken");

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/salaries/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al cargar empleados");

      const data = await response.json();
      return data.empleados || [];
    } catch (error) {
      console.error("Error cargando empleados:", error);
      toast.error("Error al cargar los empleados");
      return [];
    }
  };

  const loadEmployeeAttendances = async (employeeId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/salaries/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Error al cargar asistencias");

      const data = await response.json();
      return data.asistencias || [];
    } catch (error) {
      console.error("Error cargando asistencias:", error);
      return [];
    }
  };

  const loadEmployeeHistory = async (employeeId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/employeehistory/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Error al cargar historial");

      const data = await response.json();
      return data.historial || [];
    } catch (error) {
      console.error("Error cargando historial:", error);
      return [];
    }
  };

  const loadSupervisors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supervisors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Error al cargar supervisores");

      const data = await response.json();
      return data.sectores || [];
    } catch (error) {
      console.error("Error cargando supervisores:", error);
      return [];
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!startDate) {
      newErrors.startDate = "La fecha de inicio es obligatoria";
    }

    if (!endDate) {
      newErrors.endDate = "La fecha de fin es obligatoria";
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        newErrors.endDate = "La fecha de fin debe ser posterior a la de inicio";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateWorkingDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    // Crear una copia de la fecha de inicio
    const current = new Date(start);

    // Iterar desde la fecha de inicio hasta la fecha de fin
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Contar solo días de lunes (1) a viernes (5)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      // Avanzar al siguiente día
      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  };

  const filterAttendancesByPeriod = (
    attendances: Attendance[],
    startDate: string,
    endDate: string,
  ): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return attendances.filter((attendance) => {
      const attendanceDate = new Date(attendance.fecha);
      return attendanceDate >= start && attendanceDate <= end;
    }).length;
  };

  const handleGenerateReport = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setShowReport(false);

    try {
      // Cargar empleados
      const loadedEmployees = await loadEmployees();
      setEmployees(loadedEmployees);

      if (loadedEmployees.length === 0) {
        toast.warning("No hay empleados registrados");
        setLoading(false);
        return;
      }

      // Calcular días laborables en el periodo
      const workingDays = calculateWorkingDays(startDate, endDate);

      // Cargar asistencias y calcular datos para cada empleado
      const employeeDataPromises = loadedEmployees.map(
        async (employee: Employee) => {
          const attendances = await loadEmployeeAttendances(employee.id);
          const attendanceCount = filterAttendancesByPeriod(
            attendances,
            startDate,
            endDate,
          );

          const salary =
            attendanceCount *
            employee.puesto.horasMinimasTrabajoDiario *
            employee.puesto.valorHora;

          const attendancePercentage =
            workingDays > 0 ? (attendanceCount / workingDays) * 100 : 0;

          const role = employee.esSupervisorSector
            ? "Supervisor"
            : "Empleado";

          const history = await loadEmployeeHistory(employee.id);

          return {
            employee,
            attendanceCount,
            salary,
            attendancePercentage,
            role,
            history,
          };
        },
      );

      const employeeData = await Promise.all(employeeDataPromises);
      setEmployeeReportData(employeeData);

      // Agrupar por sectores y puestos
      const sectorMap = new Map<number, SectorReportData>();

      employeeData.forEach((empData) => {
        const { employee, salary } = empData;
        const sector = employee.puesto.sector;
        const position = employee.puesto;

        // Crear o actualizar sector
        if (!sectorMap.has(sector.id)) {
          sectorMap.set(sector.id, {
            sector,
            totalCost: 0,
            positions: [],
            employeeCount: 0,
          });
        }

        const sectorData = sectorMap.get(sector.id)!;
        sectorData.totalCost += salary;
        sectorData.employeeCount++;

        // Buscar o crear posición dentro del sector
        let positionData = sectorData.positions.find(
          (p) => p.position.id === position.id,
        );

        if (!positionData) {
          positionData = {
            position,
            totalCost: 0,
            employeeCount: 0,
          };
          sectorData.positions.push(positionData);
        }

        positionData.totalCost += salary;
        positionData.employeeCount++;
      });

      const sectorsArray = Array.from(sectorMap.values());
      setSectorReportData(sectorsArray);

      // Calcular datos de supervisores
      const supervisors = employeeData.filter(
        (empData) => empData.employee.esSupervisorSector === true,
      );

      const supervisorData = supervisors.map((supData) => {
        // Contar empleados en el mismo sector que no son supervisores
        const employeesInSector = employeeData.filter(
          (empData) =>
            empData.employee.puesto.sector.id ===
              supData.employee.puesto.sector.id &&
            empData.employee.esSupervisorSector !== true,
        ).length;

        return {
          supervisor: supData.employee,
          employeesUnderSupervision: employeesInSector,
          sector: supData.employee.puesto.sector,
          position: supData.employee.puesto,
        };
      });

      setSupervisorReportData(supervisorData);

      setShowReport(true);
      toast.success("Reporte generado exitosamente");
    } catch (error) {
      console.error("Error generando reporte:", error);
      toast.error("Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
          <h2>Generar Reporte de Costos</h2>
          <p className="text-gray-600 text-sm mt-1">
            Genere un reporte detallado de costos por periodo
          </p>
        </div>
      </div>

      {/* Formulario de fechas */}
      {!showReport && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Seleccione el Periodo
            </CardTitle>
            <CardDescription>
              Ingrese las fechas de inicio y fin para generar el reporte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha de inicio */}
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (errors.startDate) {
                        setErrors({ ...errors, startDate: "" });
                      }
                    }}
                    className={`pl-10 ${errors.startDate ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              {/* Fecha de fin */}
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Fecha de Fin <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (errors.endDate) {
                        setErrors({ ...errors, endDate: "" });
                      }
                    }}
                    className={`pl-10 ${errors.endDate ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={handleGenerateReport}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generando Reporte...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reporte generado */}
      {showReport && (
        <div className="space-y-6">
          {/* Header del reporte */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-2 text-blue-900">Reporte de Costos</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="">Fecha de inicio:</span>{" "}
                      {formatDate(startDate)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="">Fecha de fin:</span>{" "}
                      {formatDate(endDate)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="">Días laborables:</span>{" "}
                      {calculateWorkingDays(startDate, endDate)} días
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReport(false);
                    setStartDate("");
                    setEndDate("");
                    setErrors({});
                  }}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Nuevo Reporte
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumen general */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Costo Total</p>
                    <p className="text-2xl text-green-700">
                      {formatCurrency(
                        sectorReportData.reduce(
                          (acc, sector) => acc + sector.totalCost,
                          0,
                        ),
                      )}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Total Empleados
                    </p>
                    <p className="text-2xl">{employeeReportData.length}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Total Sectores
                    </p>
                    <p className="text-2xl">{sectorReportData.length}</p>
                  </div>
                  <Building2 className="w-10 h-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sección de Sectores y Puestos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Costos por Sector y Puesto
              </CardTitle>
              <CardDescription>
                Desglose de costos agrupados por sector y puesto de trabajo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sectorReportData.map((sectorData) => (
                <div
                  key={sectorData.sector.id}
                  className="border rounded-lg p-4 space-y-4 bg-gray-50"
                >
                  {/* Información del sector */}
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="text-blue-900">
                          {sectorData.sector.nombre}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {sectorData.employeeCount} empleado(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Costo Total</p>
                      <p className="text-xl text-green-700">
                        {formatCurrency(sectorData.totalCost)}
                      </p>
                    </div>
                  </div>

                  {/* Puestos dentro del sector */}
                  <div className="pl-6 space-y-3">
                    {sectorData.positions.map((positionData) => (
                      <div
                        key={positionData.position.id}
                        className="bg-white rounded-lg p-3 flex items-center justify-between border"
                      >
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="">
                              {positionData.position.nombre}
                            </p>
                            <div className="flex gap-3 text-sm text-gray-600 mt-1">
                              <span>
                                {positionData.employeeCount} empleado(s)
                              </span>
                              <span>•</span>
                              <span>
                                {formatCurrency(
                                  positionData.position.valorHora,
                                )}/hora
                              </span>
                              <span>•</span>
                              <span>
                                {
                                  positionData.position
                                    .horasMinimasTrabajoDiario
                                }h/día
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Costo</p>
                          <p className="text-lg text-green-700">
                            {formatCurrency(positionData.totalCost)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {sectorReportData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay datos de sectores para mostrar</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sección de Empleados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Detalle de Empleados
              </CardTitle>
              <CardDescription>
                Información detallada de cada empleado en el periodo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeReportData.map((empData) => (
                  <div
                    key={empData.employee.id}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="">
                              {empData.employee.nombre}{" "}
                              {empData.employee.apellido}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={
                                  empData.role === "Supervisor"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {empData.role}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                DNI: {empData.employee.dni}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <div>
                            <p className="text-xs text-gray-600">Puesto</p>
                            <p className="text-sm">
                              {empData.employee.puesto.nombre}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Sector</p>
                            <p className="text-sm">
                              {empData.employee.puesto.sector.nombre}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">
                              Asistencias
                            </p>
                            <p className="text-sm">
                              {empData.attendanceCount} días
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">
                              % Asistencia
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm">
                                {empData.attendancePercentage.toFixed(1)}%
                              </p>
                              {empData.attendancePercentage >= 90 ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : empData.attendancePercentage >= 70 ? (
                                <TrendingUp className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <TrendingUp className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Historial del empleado */}
                        <div className="mt-4">
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              const currentSet = new Set(expandedEmployees);
                              if (currentSet.has(empData.employee.id)) {
                                currentSet.delete(empData.employee.id);
                              } else {
                                currentSet.add(empData.employee.id);
                              }
                              setExpandedEmployees(currentSet);
                            }}
                          >
                            <History className="w-4 h-4" />
                            <p className="text-sm text-gray-600">
                              Ver historial
                            </p>
                            {expandedEmployees.has(empData.employee.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>

                          {expandedEmployees.has(empData.employee.id) && (
                            <div className="mt-2">
                              {empData.history.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden bg-white">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-gray-100">
                                        <TableHead>Puesto</TableHead>
                                        <TableHead>Sector</TableHead>
                                        <TableHead>Ingreso</TableHead>
                                        <TableHead>Salida</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {empData.history.map((entry) => (
                                        <TableRow key={entry.id}>
                                          <TableCell>
                                            {entry.nombrePuesto}
                                          </TableCell>
                                          <TableCell>
                                            {entry.nombreSector}
                                          </TableCell>
                                          <TableCell>
                                            {formatDate(entry.fechaIngreso)}
                                          </TableCell>
                                          <TableCell>
                                            {entry.fechaSalida != null
                                              ? formatDate(entry.fechaSalida)
                                              : ""}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 mt-2">
                                  No hay historial disponible
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">
                          Sueldo Periodo
                        </p>
                        <p className="text-xl text-green-700">
                          {formatCurrency(empData.salary)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {employeeReportData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No hay datos de empleados para mostrar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          
        </div>
      )}
    </div>
  );
}