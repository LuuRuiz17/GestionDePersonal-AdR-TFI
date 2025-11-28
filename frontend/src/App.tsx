import { useState, useEffect } from "react";
import { MainMenu } from "./components/MainMenu";
import { ManagePositions } from "./components/ManagePositions";
import { ManageEmployees } from "./components/ManageEmployees";
import { ConsultSector } from "./components/ConsultSector";
import { AssignSupervisor } from "./components/AssignSupervisor";
import { GenerateRequest } from "./components/GenerateRequest";
import { ManageRequests } from "./components/ManageRequests";
import { CalculateSalaries } from "./components/CalculateSalaries";
import { GenerateReports } from "./components/GenerateReports";
import { RegisterAttendance } from "./components/RegisterAttendance";
import { Login } from "./components/Login";
import { Toaster } from "./components/ui/sonner";
import { Badge } from "./components/ui/badge";

export type ViewType =
  | "menu"
  | "manage-positions"
  | "manage-employees"
  | "assign-supervisor"
  | "register-attendance"
  | "manage-requests"
  | "calculate-salaries"
  | "generate-reports"
  | "consult-sector"
  | "generate-request";

export default function App() {
  const [currentView, setCurrentView] =
    useState<ViewType>("menu");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserDni, setCurrentUserDni] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");

  // Inicializar credenciales de ejemplo
  useEffect(() => {
    const storedCredentials = localStorage.getItem(
      "userCredentials",
    );
    if (!storedCredentials) {
      // Crear credenciales de ejemplo para los empleados existentes
      const exampleCredentials = {
        "12345678": {
          password: "Admin123",
          name: "Juan Pérez",
          employeeId: "EMP001",
        },
        "23456789": {
          password: "Maria123",
          name: "María González",
          employeeId: "EMP002",
        },
        "45678901": {
          password: "Ana12345",
          name: "Ana Martínez",
          employeeId: "EMP004",
        },
      };
      localStorage.setItem(
        "userCredentials",
        JSON.stringify(exampleCredentials),
      );
    }
  }, []);

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleBackToMenu = () => {
    setCurrentView("menu");
  };

  const handleLogin = (dni: string, name: string) => {
    const role = localStorage.getItem("userRole") || "";
    setCurrentUserDni(dni);
    setCurrentUserName(name);
    setCurrentUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Borrar el token del localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");

    setIsLoggedIn(false);
    setCurrentUserDni("");
    setCurrentUserName("");
    setCurrentUserRole("");
    setCurrentView("menu");
  };

  const getRoleDisplayName = (role: string): string => {
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

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'SUPERVISOR':
        return 'default';
      case 'EMPLOYEE':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Si no está logueado, mostrar login
  if (!isLoggedIn) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-blue-600">
            Sistema de Gestión de Personal
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500 text-sm">
              {currentUserName} - DNI: {currentUserDni}
            </p>
            {currentUserRole && (
              <Badge variant={getRoleBadgeVariant(currentUserRole)}>
                {getRoleDisplayName(currentUserRole)}
              </Badge>
            )}
          </div>
        </div>
        <button
          className="px-4 py-2 border border-red-400 text-red-600 rounded hover:bg-red-50 transition"
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Toaster position="top-right" richColors />
        {currentView === "menu" && (
          <MainMenu onNavigate={handleNavigate} />
        )}
        {currentView === "manage-positions" && (
          <ManagePositions onBack={handleBackToMenu} />
        )}
        {currentView === "manage-employees" && (
          <ManageEmployees onBack={handleBackToMenu} />
        )}
        {currentView === "consult-sector" && (
          <ConsultSector onBack={handleBackToMenu} />
        )}
        {currentView === "assign-supervisor" && (
          <AssignSupervisor onBack={handleBackToMenu} />
        )}
        {currentView === "generate-request" && (
          <GenerateRequest onBack={handleBackToMenu} />
        )}
        {currentView === "manage-requests" && (
          <ManageRequests onBack={handleBackToMenu} />
        )}
        {currentView === "register-attendance" && (
          <RegisterAttendance onBack={handleBackToMenu} />
        )}
        {currentView === "calculate-salaries" && (
          <CalculateSalaries onBack={handleBackToMenu} />
        )}
        {currentView === "generate-reports" && (
          <GenerateReports onBack={handleBackToMenu} />
        )}
      </main>
    </div>
  );
}