import { useState, useEffect } from "react";
import {
  Plus,
  ArrowLeft,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { EmployeeDialog } from "./EmployeeDialog";
import { RegisterPassword } from "./RegisterPassword";
import type { Position } from "./ManagePositions";
import { toast } from "sonner@2.0.3";

export interface Employee {
  id: string;
  dni: string;
  name: string;
  lastName: string;
  address: string;
  birthDate: string;
  hireDate: string;
  positionId: string;
  email: string;
  phone: string;
}

interface ManageEmployeesProps {
  onBack: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;


export function ManageEmployees({
  onBack,
}: ManageEmployeesProps) {
  // Posiciones disponibles - cargar desde la API
  const [positions, setPositions] = useState<Position[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesData, setEmployeesData] = useState<any[]>([]); // Guardar datos completos de la API
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPasswordRegister, setShowPasswordRegister] =
    useState(false);
  const [newlyCreatedEmployee, setNewlyCreatedEmployee] =
    useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar empleados desde la API
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");

      try {
        const response = await fetch(
          API_BASE_URL + "/api/employees/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        // Console.log de la respuesta completa
        console.log(
          "Respuesta completa de la API (GET empleados):",
          data,
        );

        if (data.status === "success" && data.empleados) {
          // Guardar datos completos
          setEmployeesData(data.empleados);

          // Mapear los datos del API al formato de Employee
          const mappedEmployees: Employee[] =
            data.empleados.map((emp: any) => ({
              id: String(emp.id),
              dni: String(emp.dni),
              name: emp.nombre,
              lastName: emp.apellido,
              address: emp.domicilio,
              birthDate: emp.fechaNacimiento,
              hireDate: emp.fechaContratacion,
              positionId: emp.puesto?.id
                ? String(emp.puesto.id)
                : "0",
              email: emp.correo,
              phone: emp.telefono,
            }));
          setEmployees(mappedEmployees);
        }
      } catch (error) {
        console.error("Error al cargar empleados:", error);
        toast.error("Error al cargar empleados", {
          description:
            "No se pudieron obtener los datos de los empleados",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Cargar puestos desde la API
  useEffect(() => {
    const fetchPositions = async () => {
      const token = localStorage.getItem("authToken");

      try {
        const response = await fetch(
          API_BASE_URL + "/api/jobpositions/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('Respuesta completa de la API (GET puestos):', data);

        if (data.puestos && Array.isArray(data.puestos)) {
          // Mapear los puestos de la API al formato Position
          const mappedPositions: Position[] = data.puestos.map((pos: any) => ({
            id: String(pos.id),
            name: pos.nombre,
            sector: pos.sector?.nombre || 'Sin sector',
            sectorId: pos.sector?.id,
            hourlyRate: pos.valorHora || 0,
            minDailyHours: pos.horasMinimasTrabajoDiario || 0,
          }));
          setPositions(mappedPositions);
        }
      } catch (error) {
        console.error("Error al cargar puestos:", error);
        toast.error("Error al cargar puestos", {
          description:
            "No se pudieron obtener los datos de los puestos",
        });
      }
    };

    fetchPositions();
  }, []);

  // Función para recargar empleados
  const reloadEmployees = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        API_BASE_URL + "/api/employees/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      console.log(
        "Respuesta completa de la API (GET empleados - recarga):",
        data,
      );

      if (data.status === "success" && data.empleados) {
        setEmployeesData(data.empleados);

        const mappedEmployees: Employee[] = data.empleados.map(
          (emp: any) => ({
            id: String(emp.id),
            dni: String(emp.dni),
            name: emp.nombre,
            lastName: emp.apellido,
            address: emp.domicilio,
            birthDate: emp.fechaNacimiento,
            hireDate: emp.fechaContratacion,
            positionId: emp.puesto?.id
              ? String(emp.puesto.id)
              : "0",
            email: emp.correo,
            phone: emp.telefono,
          }),
        );
        setEmployees(mappedEmployees);
      }
    } catch (error) {
      console.error("Error al recargar empleados:", error);
      toast.error("Error al recargar empleados", {
        description:
          "No se pudieron obtener los datos de los empleados",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionById = (
    positionId: string,
  ): Position | undefined => {
    return positions.find((p) => p.id === positionId);
  };

  // Obtener datos completos del empleado desde la API
  const getEmployeeData = (id: string) => {
    return employeesData.find((emp) => String(emp.id) === id);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        API_BASE_URL + `/api/employees/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      // Console.log de la respuesta
      console.log(
        "Respuesta completa de la API (DELETE empleado):",
        data,
      );

      if (data.status === "success") {
        // Eliminar del estado local
        setEmployees(employees.filter((e) => e.id !== id));
        setEmployeesData(
          employeesData.filter((e) => String(e.id) !== id),
        );

        // Toast de éxito
        toast.success("Empleado eliminado", {
          description:
            "El empleado ha sido eliminado correctamente",
        });
      } else {
        toast.error("Error al eliminar", {
          description:
            data.mensaje || "No se pudo eliminar el empleado",
        });
      }
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor",
      });
    }
  };

  const handleSaveEmployee = async (employee: Employee) => {
    if (editingEmployee) {
      // Editar empleado existente - llamar a API PUT
      const token = localStorage.getItem("authToken");

      try {
        const employeeDTO = {
          apellido: employee.lastName,
          nombre: employee.name,
          dni: parseInt(employee.dni),
          correo: employee.email,
          domicilio: employee.address,
          fechaNacimiento: employee.birthDate,
          fechaContratacion: employee.hireDate,
          telefono: employee.phone,
          puesto: {
            id: parseInt(employee.positionId),
          },
        };

        const response = await fetch(
          API_BASE_URL + `/api/employees/${employee.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(employeeDTO),
          },
        );

        const data = await response.json();

        // Console.log de la respuesta
        console.log(
          "Respuesta completa de la API (PUT empleado):",
          data,
        );

        if (data.status === "success") {
          // Actualizar en el estado local
          setEmployees(
            employees.map((e) =>
              e.id === employee.id ? employee : e,
            ),
          );

          // Actualizar employeesData también
          if (data.empleado) {
            setEmployeesData(
              employeesData.map((e) =>
                String(e.id) === employee.id
                  ? data.empleado
                  : e,
              ),
            );
          }

          // Toast de éxito
          toast.success("Empleado actualizado", {
            description:
              "Los datos del empleado han sido actualizados correctamente",
          });
        } else {
          toast.error("Error al actualizar", {
            description:
              data.mensaje ||
              "No se pudo actualizar el empleado",
          });
        }
      } catch (error) {
        console.error("Error al actualizar empleado:", error);
        toast.error("Error de conexión", {
          description: "No se pudo conectar con el servidor",
        });
      }
    } else {
      // Agregar nuevo empleado - NO agregarlo al estado local todavía
      // Solo guardarlo temporalmente para el registro de contraseña
      setNewlyCreatedEmployee(employee);
      setShowPasswordRegister(true);
    }
    setIsDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
  };

  // Filtrar empleados por DNI o nombre
  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName =
      `${employee.name} ${employee.lastName}`.toLowerCase();
    return (
      employee.dni.includes(searchTerm) ||
      fullName.includes(searchLower)
    );
  });

  // Paginación
  const totalPages = Math.ceil(
    filteredEmployees.length / itemsPerPage,
  );
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Resetear a la página 1 si la página actual ya no existe después de cambiar itemsPerPage
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Si está mostrando el registro de contraseña, renderizar solo ese componente
  if (showPasswordRegister && newlyCreatedEmployee) {
    return (
      <RegisterPassword
        employee={newlyCreatedEmployee}
        onComplete={async () => {
          setShowPasswordRegister(false);
          setNewlyCreatedEmployee(null);
          // Recargar la lista de empleados después del registro exitoso
          await reloadEmployees();
        }}
        onCancel={() => {
          setShowPasswordRegister(false);
          setNewlyCreatedEmployee(null);
          // No recargar empleados si se cancela
        }}
      />
    );
  }

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
            <h2>Gestionar Empleados</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administre los empleados de la organización
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3>Lista de Empleados</h3>
          <Button
            onClick={handleAddEmployee}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Empleado
          </Button>
        </div>

        {/* Filtro de búsqueda */}
        <div className="mb-6">
          <div className="relative max-w-md">
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

        {/* Selector de items por página */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) =>
              setItemsPerPage(Number(e.target.value))
            }
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">
            empleados por página
          </span>
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
                <TableHead>Correo</TableHead>
                <TableHead className="text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-600">
                        Cargando empleados...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentEmployees.length > 0 ? (
                currentEmployees.map((employee) => {
                  // Obtener datos completos del empleado de la API
                  const empData = getEmployeeData(employee.id);
                  const positionName =
                    empData?.puesto?.nombre || "N/A";
                  const sectorName =
                    empData?.puesto?.sector?.nombre || "N/A";

                  return (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.dni}</TableCell>
                      <TableCell>
                        {employee.name} {employee.lastName}
                      </TableCell>
                      <TableCell>{positionName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                          {sectorName}
                        </span>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleEditEmployee(employee)
                            }
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Está seguro?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta accin eliminará
                                  permanentemente al empleado "
                                  {employee.name}{" "}
                                  {employee.lastName}". Esta
                                  acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteEmployee(
                                      employee.id,
                                    )
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    {searchTerm
                      ? "No se encontraron empleados con ese criterio de búsqueda"
                      : "No hay empleados registrados"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredEmployees.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1} a{" "}
              {Math.min(endIndex, filteredEmployees.length)} de{" "}
              {filteredEmployees.length} empleado(s)
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.max(1, currentPage - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: totalPages },
                    (_, i) => i + 1,
                  ).map((page) => {
                    // Mostrar solo páginas cercanas a la actual
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 &&
                        page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={
                            page === currentPage
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(totalPages, currentPage + 1),
                    )
                  }
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <EmployeeDialog
        isOpen={isDialogOpen}
        employee={editingEmployee}
        positions={positions}
        onSave={handleSaveEmployee}
        onClose={handleCloseDialog}
      />
    </div>
  );
}