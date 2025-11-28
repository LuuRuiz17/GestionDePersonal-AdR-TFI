package com.adminrec.tfi.util.dataLoaders;

import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.interfaces.RepositorioCuentas;
import com.adminrec.tfi.interfaces.RepositorioEmpleados;
import com.adminrec.tfi.services.ServicioCuenta;
import com.adminrec.tfi.util.enums.Rol;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(4)
public class CuentaDataLoader implements CommandLineRunner {
    private final ServicioCuenta servicioCuenta;
    private final RepositorioEmpleados repositorioEmpleados;

    public CuentaDataLoader(ServicioCuenta servicioCuenta,  RepositorioEmpleados repositorioEmpleados) {
        this.servicioCuenta = servicioCuenta;
        this.repositorioEmpleados = repositorioEmpleados;
    }

    @Override
    public void run(String... args) {
// ================== SISTEMAS ==================
        Empleado supervisorSistemas   = repositorioEmpleados.findByDni(30123456).get(); // Luciano Fernández
        Empleado supervisorBackend    = repositorioEmpleados.findByDni(12345678).get(); // Francisco Gomez
        Empleado devMaria             = repositorioEmpleados.findByDni(98765432).get(); // María López

        servicioCuenta.crearCuenta(supervisorSistemas, "admin123",  Rol.ADMIN);
        servicioCuenta.crearCuenta(supervisorBackend,  "supervisor", Rol.SUPERVISOR);
        servicioCuenta.crearCuenta(devMaria,           "empleado", Rol.EMPLOYEE);

        // ================= CONTABILIDAD ===============
        Empleado jefeContab           = repositorioEmpleados.findByDni(22333444).get(); // Carolina Pérez
        Empleado analistaContab1      = repositorioEmpleados.findByDni(33444555).get(); // Javier Rodríguez

        servicioCuenta.crearCuenta(jefeContab,      "conta_jefa", Rol.SUPERVISOR);
        servicioCuenta.crearCuenta(analistaContab1, "conta_javi", Rol.EMPLOYEE);

        // ============ VENTAS NACIONALES ===============
        Empleado jefeVentasNac        = repositorioEmpleados.findByDni(44555666).get(); // Sofía Martínez
        Empleado vendedor1            = repositorioEmpleados.findByDni(55666777).get(); // Diego Giménez

        servicioCuenta.crearCuenta(jefeVentasNac, "ventas_jefa",  Rol.SUPERVISOR);
        servicioCuenta.crearCuenta(vendedor1,     "ventas_diego", Rol.EMPLOYEE);

        // ==================== RRHH =====================
        Empleado jefeRRHH             = repositorioEmpleados.findByDni(66777888).get(); // Valeria Suárez
        Empleado analistaRRHHEmp      = repositorioEmpleados.findByDni(77888999).get(); // Axel Navarro

        servicioCuenta.crearCuenta(jefeRRHH,        "rrhh_jefa", Rol.SUPERVISOR);
        servicioCuenta.crearCuenta(analistaRRHHEmp, "rrhh_axel", Rol.EMPLOYEE);

        // ================= PRODUCCIÓN =================
        Empleado supervisorPlantaEmp  = repositorioEmpleados.findByDni(88999000).get(); // Hernán Castro
        Empleado operarioEmp          = repositorioEmpleados.findByDni(90001111).get(); // Matías Ríos

        servicioCuenta.crearCuenta(supervisorPlantaEmp, "prod_sup", Rol.SUPERVISOR);
        servicioCuenta.crearCuenta(operarioEmp,         "prod_op",  Rol.EMPLOYEE);
    }
}
