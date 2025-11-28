import { useState, useEffect } from "react";
import {
  ArrowLeft,
  DollarSign,
  Search,
  User,
  Calculator,
  FileText,
  Calendar,
  CheckCircle2,
  Eye,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { toast } from "sonner@2.0.3";

interface CalculateSalariesProps {
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
}

interface Attendance {
  id: number;
  fecha: string;
}

export interface SalaryPayment {
  id: string;
  employeeId: number;
  employeeName: string;
  employeeLastName: string;
  positionName: string;
  valorHora: number;
  horasMinimasTrabajoDiario: number;
  attendanceCount: number;
  netSalary: number;
  period: string; // MM/YYYY
  date: string;
  timestamp: number;
}

type ViewMode = "list" | "calculate" | "success";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export function CalculateSalaries({
  onBack,
}: CalculateSalariesProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>(
    [],
  );
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulario de pago
  const [period, setPeriod] = useState<string>("");
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  const [calculatedSalary, setCalculatedSalary] = useState<
    number | null
  >(null);
  const [filteredAttendanceCount, setFilteredAttendanceCount] =
    useState<number>(0);
  const [lastPayment, setLastPayment] =
    useState<SalaryPayment | null>(null);

  // Para el diálogo de detalles
  const [selectedPaymentDetail, setSelectedPaymentDetail] =
    useState<SalaryPayment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] =
    useState(false);
  
const token = localStorage.getItem("authToken");
  
  // Cargar datos
  useEffect(() => {
    loadEmployees();
    loadPayments();

    // Establecer periodo actual por defecto
    const now = new Date();
    const currentPeriod = `${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    setPeriod(currentPeriod);
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/salaries/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );

      if (!response.ok)
        throw new Error("Error al cargar empleados");

      const data = await response.json();
      setEmployees(data.empleados || []);
      toast.success("Empleados cargados correctamente");
    } catch (error) {
      console.error("Error cargando empleados:", error);
      toast.error("Error al cargar los empleados");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = () => {
    const loadedPayments: SalaryPayment[] = JSON.parse(
      localStorage.getItem("salaryPayments") || "[]",
    );
    setPayments(loadedPayments);
  };

  const loadEmployeeAttendances = async (
    employeeId: number,
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/salaries/${employeeId}`,{
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
      if (!response.ok)
        throw new Error("Error al cargar asistencias");

      const data = await response.json();
      setAttendances(data.asistencias || []);
      toast.success("Asistencias cargadas correctamente");
    } catch (error) {
      console.error("Error cargando asistencias:", error);
      toast.error(
        "Error al cargar las asistencias del empleado",
      );
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const fullName =
      `${employee.nombre} ${employee.apellido}`.toLowerCase();

    return (
      employee.dni.toString().includes(searchTerm) ||
      fullName.includes(searchLower)
    );
  });

  const handleSelectEmployee = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewMode("calculate");
    // Reset form
    setErrors({});
    setCalculatedSalary(null);
    setFilteredAttendanceCount(0);

    // Cargar asistencias del empleado
    await loadEmployeeAttendances(employee.id);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validar periodo
    if (!period) {
      newErrors.period = "El periodo es obligatorio";
    } else if (!/^\d{2}\/\d{4}$/.test(period)) {
      newErrors.period =
        "El periodo debe tener formato MM/YYYY";
    } else {
      // Validar que sea un mes válido (01-12)
      const [month] = period.split("/");
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) {
        newErrors.period = "El mes debe estar entre 01 y 12";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filterAttendancesByPeriod = (
    attendances: Attendance[],
    period: string,
  ): number => {
    const [month, year] = period.split("/");
    const targetMonth = parseInt(month, 10);
    const targetYear = parseInt(year, 10);

    return attendances.filter((attendance) => {
      const attendanceDate = new Date(attendance.fecha);
      const attendanceMonth = attendanceDate.getMonth() + 1; // getMonth() retorna 0-11
      const attendanceYear = attendanceDate.getFullYear();

      return (
        attendanceMonth === targetMonth &&
        attendanceYear === targetYear
      );
    }).length;
  };

  const handleCalculateSalary = () => {
    if (!validateForm() || !selectedEmployee) return;

    // Filtrar asistencias por el periodo seleccionado
    const attendanceCount = filterAttendancesByPeriod(
      attendances,
      period,
    );
    setFilteredAttendanceCount(attendanceCount);

    if (attendanceCount === 0) {
      toast.warning(
        "No hay asistencias registradas para el periodo seleccionado",
      );
      setCalculatedSalary(0);
      return;
    }

    // Calcular sueldo: cantidad_asistencias * horasMinimasTrabajoDiario * valorHora
    const { valorHora, horasMinimasTrabajoDiario } =
      selectedEmployee.puesto;
    const netSalary =
      attendanceCount * horasMinimasTrabajoDiario * valorHora;

    setCalculatedSalary(netSalary);
    toast.success(
      `Sueldo calculado: ${attendanceCount} asistencias en el periodo`,
    );
  };

  const handleRegisterPayment = () => {
    if (!selectedEmployee || calculatedSalary === null) return;

    const newPayment: SalaryPayment = {
      id: `PAY${Date.now()}`,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.nombre,
      employeeLastName: selectedEmployee.apellido,
      positionName: selectedEmployee.puesto.nombre,
      valorHora: selectedEmployee.puesto.valorHora,
      horasMinimasTrabajoDiario:
        selectedEmployee.puesto.horasMinimasTrabajoDiario,
      attendanceCount: filteredAttendanceCount,
      netSalary: calculatedSalary,
      period: period,
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };

    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    localStorage.setItem(
      "salaryPayments",
      JSON.stringify(updatedPayments),
    );

    setLastPayment(newPayment);
    setViewMode("success");
    toast.success("Pago registrado exitosamente");

    // Volver al listado después de 3 segundos
    setTimeout(() => {
      setViewMode("list");
      setSelectedEmployee(null);
      setCalculatedSalary(null);
      setFilteredAttendanceCount(0);
      setAttendances([]);
    }, 3000);
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

  // Vista de éxito
  if (viewMode === "success" && lastPayment) {
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
            <h2>Gestionar Pago de Sueldo</h2>
            <p className="text-gray-600 text-sm mt-1">
              Calcule y registre los pagos de sueldo
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-2xl w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-green-600 mb-2">
                    ¡Pago Registrado Exitosamente!
                  </h3>
                  <p className="text-gray-600">
                    El pago de sueldo ha sido calculado y
                    registrado correctamente
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg w-full space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">
                      Empleado:
                    </span>
                    <span>
                      {lastPayment.employeeName}{" "}
                      {lastPayment.employeeLastName}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">
                      Puesto:
                    </span>
                    <span>{lastPayment.positionName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">
                      Periodo:
                    </span>
                    <span>{lastPayment.period}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">
                      Asistencias:
                    </span>
                    <span>
                      {lastPayment.attendanceCount} días
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">
                      Valor por hora:
                    </span>
                    <span>
                      {formatCurrency(lastPayment.valorHora)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">
                      Horas mínimas diarias:
                    </span>
                    <span>
                      {lastPayment.horasMinimasTrabajoDiario}h
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 text-lg">
                    <span>Sueldo Neto:</span>
                    <span className="text-green-600">
                      {formatCurrency(lastPayment.netSalary)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista de cálculo
  if (viewMode === "calculate" && selectedEmployee) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                setViewMode("list");
                setSelectedEmployee(null);
                setAttendances([]);
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Listado
            </Button>
            <div>
              <h2>Calcular Sueldo</h2>
              <p className="text-gray-600 text-sm mt-1">
                Seleccione el periodo para calcular el sueldo
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Datos del Pago de Sueldo
              </CardTitle>
              <CardDescription>
                Seleccione el periodo para calcular el sueldo
                basado en asistencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información del empleado */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600 mb-2">
                  Información del Empleado
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Nombre:
                    </p>
                    <p>
                      {selectedEmployee.nombre}{" "}
                      {selectedEmployee.apellido}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      DNI:
                    </p>
                    <p>{selectedEmployee.dni}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Puesto:
                    </p>
                    <p>{selectedEmployee.puesto.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Sector:
                    </p>
                    <p>
                      {selectedEmployee.puesto.sector.nombre}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del puesto */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Información del Puesto
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Valor por hora:
                    </p>
                    <p className="text-xl text-green-700">
                      {formatCurrency(
                        selectedEmployee.puesto.valorHora,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Horas mínimas diarias:
                    </p>
                    <p className="text-xl text-green-700">
                      {
                        selectedEmployee.puesto
                          .horasMinimasTrabajoDiario
                      }
                      h
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de asistencias */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Asistencias totales registradas
                    </p>
                    <p className="text-2xl text-purple-700">
                      {attendances.length}
                    </p>
                  </div>
                  <Calendar className="w-12 h-12 text-purple-600" />
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                {/* Periodo */}
                <div className="space-y-2">
                  <Label htmlFor="period">
                    Periodo{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="period"
                      type="text"
                      placeholder="MM/YYYY"
                      value={period}
                      onChange={(e) => {
                        setPeriod(e.target.value);
                        if (errors.period) {
                          setErrors({ ...errors, period: "" });
                        }
                        setCalculatedSalary(null);
                      }}
                      className={`pl-10 ${errors.period ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.period && (
                    <p className="text-sm text-red-500">
                      {errors.period}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Formato: MM/YYYY (ej: 09/2025 para
                    Septiembre 2025)
                  </p>
                </div>
              </div>

              {/* Resultado del cálculo */}
              {calculatedSalary !== null && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
                  <h3 className="text-center mb-4 text-green-900">
                    Resumen del Cálculo
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Asistencias en el periodo:</span>
                      <span>
                        {filteredAttendanceCount} días
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Horas por día:</span>
                      <span>
                        {
                          selectedEmployee.puesto
                            .horasMinimasTrabajoDiario
                        }
                        h
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Valor por hora:</span>
                      <span>
                        {formatCurrency(
                          selectedEmployee.puesto.valorHora,
                        )}
                      </span>
                    </div>
                    <div className="border-t-2 border-green-300 pt-3 flex justify-between text-gray-700">
                      <span>Total de horas:</span>
                      <span>
                        {filteredAttendanceCount *
                          selectedEmployee.puesto
                            .horasMinimasTrabajoDiario}
                        h
                      </span>
                    </div>
                    <div className="border-t-2 border-green-300 pt-3 flex justify-between text-xl">
                      <span className="text-green-900">
                        Total a Pagar:
                      </span>
                      <span className="text-green-700">
                        {formatCurrency(calculatedSalary)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setViewMode("list");
                    setSelectedEmployee(null);
                    setAttendances([]);
                  }}
                >
                  Cancelar
                </Button>
                {calculatedSalary === null ? (
                  <Button
                    type="button"
                    onClick={handleCalculateSalary}
                    disabled={loading}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calcular Sueldo
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleRegisterPayment}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Registrar Pago
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista de listado (por defecto)
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
          <h2>Gestionar Pago de Sueldo</h2>
          <p className="text-gray-600 text-sm mt-1">
            Seleccione un empleado para calcular y registrar su
            sueldo
          </p>
        </div>
      </div>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees" className="gap-2">
            <User className="w-4 h-4" />
            Seleccionar Empleado
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="w-4 h-4" />
            Reportes de Sueldos
          </TabsTrigger>
        </TabsList>

        {/* Tab de empleados */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Empleados</CardTitle>
              <CardDescription>
                Busque y seleccione un empleado para calcular su
                sueldo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Buscador */}
              <div className="mb-6">
                <Label htmlFor="search" className="mb-2 block">
                  Buscar Empleado
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Buscar por DNI o nombre..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tabla de empleados */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>DNI</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Puesto</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Valor/Hora</TableHead>
                      <TableHead>Horas Mín./Día</TableHead>
                      <TableHead className="text-right">
                        Acción
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          Cargando empleados...
                        </TableCell>
                      </TableRow>
                    ) : filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => {
                        return (
                          <TableRow key={employee.id}>
                            <TableCell>
                              {employee.dni}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                {employee.nombre}{" "}
                                {employee.apellido}
                              </div>
                            </TableCell>
                            <TableCell>
                              {employee.puesto.nombre}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {employee.puesto.sector.nombre}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-green-700">
                              {formatCurrency(
                                employee.puesto.valorHora,
                              )}
                            </TableCell>
                            <TableCell>
                              {
                                employee.puesto
                                  .horasMinimasTrabajoDiario
                              }
                              h
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleSelectEmployee(employee)
                                }
                                className="gap-2"
                              >
                                <Calculator className="w-4 h-4" />
                                Calcular Sueldo
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-gray-500"
                        >
                          No se encontraron empleados con los
                          criterios de búsqueda
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Mostrando {filteredEmployees.length} empleado(s)
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de reportes */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reporte de Pagos de Sueldo
              </CardTitle>
              <CardDescription>
                Historial completo de pagos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Pagos
                        </p>
                        <p className="text-2xl">
                          {payments.length}
                        </p>
                      </div>
                      <FileText className="w-10 h-10 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Monto Total
                        </p>
                        <p className="text-xl">
                          {formatCurrency(
                            payments.reduce(
                              (acc, p) => acc + p.netSalary,
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
                          Último Periodo
                        </p>
                        <p className="text-xl">
                          {payments.length > 0
                            ? payments[payments.length - 1]
                                .period
                            : "N/A"}
                        </p>
                      </div>
                      <Calendar className="w-10 h-10 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de reportes */}
              {payments.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Empleado</TableHead>
                        <TableHead>Puesto</TableHead>
                        <TableHead>Periodo</TableHead>
                        <TableHead>Asistencias</TableHead>
                        <TableHead>Sueldo Neto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments
                        .sort(
                          (a, b) => b.timestamp - a.timestamp,
                        )
                        .map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                {payment.employeeName}{" "}
                                {payment.employeeLastName}
                              </div>
                            </TableCell>
                            <TableCell>
                              {payment.positionName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {payment.period}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {payment.attendanceCount} días
                            </TableCell>
                            <TableCell className="text-green-700">
                              {formatCurrency(
                                payment.netSalary,
                              )}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {formatDate(payment.date)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPaymentDetail(
                                    payment,
                                  );
                                  setIsDetailDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay pagos registrados aún</p>
                  <p className="text-sm mt-2">
                    Los pagos aparecerán aquí una vez que
                    calcule y registre sueldos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de detalles */}
      <Dialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Pago</DialogTitle>
            <DialogDescription>
              Información completa del pago de sueldo
            </DialogDescription>
          </DialogHeader>
          {selectedPaymentDetail && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">
                    Empleado:
                  </span>
                  <span>
                    {selectedPaymentDetail.employeeName}{" "}
                    {selectedPaymentDetail.employeeLastName}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Puesto:</span>
                  <span>
                    {selectedPaymentDetail.positionName}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">
                    Periodo:
                  </span>
                  <span>{selectedPaymentDetail.period}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">
                    Asistencias:
                  </span>
                  <span>
                    {selectedPaymentDetail.attendanceCount} días
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">
                    Valor por hora:
                  </span>
                  <span>
                    {formatCurrency(
                      selectedPaymentDetail.valorHora,
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">
                    Horas mínimas diarias:
                  </span>
                  <span>
                    {
                      selectedPaymentDetail.horasMinimasTrabajoDiario
                    }
                    h
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">
                    Total de horas:
                  </span>
                  <span>
                    {selectedPaymentDetail.attendanceCount *
                      selectedPaymentDetail.horasMinimasTrabajoDiario}
                    h
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-lg">
                  <span>Sueldo Neto:</span>
                  <span className="text-green-600">
                    {formatCurrency(
                      selectedPaymentDetail.netSalary,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Fecha de pago:</span>
                  <span>
                    {formatDate(selectedPaymentDetail.date)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}