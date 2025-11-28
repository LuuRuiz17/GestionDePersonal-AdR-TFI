package com.adminrec.tfi.util.dataLoaders;

import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.entities.IngresoEgreso;
import com.adminrec.tfi.entities.Puesto;
import com.adminrec.tfi.entities.Sector;
import com.adminrec.tfi.interfaces.RepositorioEmpleados;
import com.adminrec.tfi.interfaces.RepositorioIngresoEgreso;
import com.adminrec.tfi.interfaces.RepositorioPuestos;
import com.adminrec.tfi.interfaces.RepositorioSectores;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Order(3)
public class EmpleadoDataLoader implements CommandLineRunner {

    private final RepositorioEmpleados repositorioEmpleados;
    private final RepositorioSectores repositorioSectores;
    private final RepositorioPuestos repositorioPuestos;
    private final RepositorioIngresoEgreso repositorioIngresoEgreso;

    public EmpleadoDataLoader(
            RepositorioEmpleados repositorioEmpleados,
            RepositorioSectores repositorioSectores,
            RepositorioPuestos repositorioPuestos,
            RepositorioIngresoEgreso repositorioIngresoEgreso
    ) {
        this.repositorioEmpleados = repositorioEmpleados;
        this.repositorioSectores = repositorioSectores;
        this.repositorioPuestos = repositorioPuestos;
        this.repositorioIngresoEgreso = repositorioIngresoEgreso;
    }

    @Override
    public void run(String... args) {

        // ====================================================
        //                      SECTORES
        // ====================================================
        Sector sistemas      = repositorioSectores.findByNombre("Sistemas").get();
        Sector contabilidad  = repositorioSectores.findByNombre("Contabilidad").get();
        Sector ventasNac     = repositorioSectores.findByNombre("Ventas Nacionales").get();
        Sector rrhh          = repositorioSectores.findByNombre("Recursos Humanos").get();
        Sector produccion    = repositorioSectores.findByNombre("Producción").get();

        // ====================================================
        //                      PUESTOS
        // ====================================================
        Puesto liderTecnico       = repositorioPuestos.findByNombreAndSector("Líder Técnico", sistemas).get();
        Puesto desarrolladorBack  = repositorioPuestos.findByNombreAndSector("Desarrollador Backend", sistemas).get();

        Puesto contadorSenior     = repositorioPuestos.findByNombreAndSector("Contador Senior", contabilidad).get();
        Puesto analistaContable   = repositorioPuestos.findByNombreAndSector("Analista Contable", contabilidad).get();

        Puesto jefeVentas         = repositorioPuestos.findByNombreAndSector("Jefe de Ventas", ventasNac).get();
        Puesto vendedor           = repositorioPuestos.findByNombreAndSector("Vendedor", ventasNac).get();

        Puesto jefeRRHH           = repositorioPuestos.findByNombreAndSector("Jefe de RRHH", rrhh).get();
        Puesto analistaRRHH       = repositorioPuestos.findByNombreAndSector("Analista de RRHH", rrhh).get();

        Puesto supervisorPlanta   = repositorioPuestos.findByNombreAndSector("Supervisor de Planta", produccion).get();
        Puesto operario           = repositorioPuestos.findByNombreAndSector("Operario", produccion).get();

        // ====================================================
        // MÉTODO UTIL PARA CREAR EMPLEADO + HISTORIAL
        // ====================================================
        java.util.function.BiFunction<Empleado, Puesto, Empleado> guardarEmpleadoConHistorial =
                (empleado, puesto) -> {
                    repositorioEmpleados.save(empleado);

                    IngresoEgreso ie = new IngresoEgreso();
                    ie.setEmpleado(empleado);
                    ie.setPuesto(puesto);
                    ie.setCreadoEn(empleado.getFechaContratacion());
                    repositorioIngresoEgreso.save(ie);

                    return empleado;
                };


        // ====================================================
        //                 EMPLEADOS: SISTEMAS
        // ====================================================

        // Supervisor principal (ADMIN)
        if (repositorioEmpleados.findByDni(30123456).isEmpty()) {

            Empleado e = new Empleado();
            e.setPuesto(liderTecnico);
            e.setSupervisor(null);
            e.setEsSupervisorDeSector(true);
            e.setApellido("Fernández");
            e.setNombre("Luciano");
            e.setDni(30123456);
            e.setCorreo("lfernandez@sistemas.com");
            e.setDomicilio("Av. Las Heras 1234, CABA");
            e.setFechaNacimiento(LocalDate.of(1985, 6, 12));
            e.setFechaContratacion(LocalDate.of(2015, 3, 1));
            e.setTelefono("11-5432-9988");

            guardarEmpleadoConHistorial.apply(e, liderTecnico);
        }

        Empleado supervisorSistemas = repositorioEmpleados.findByDni(30123456).get();

        // Supervisor Backend
        if (repositorioEmpleados.findByDni(12345678).isEmpty()) {

            Empleado e = new Empleado();
            e.setPuesto(desarrolladorBack);
            e.setSupervisor(supervisorSistemas);
            e.setEsSupervisorDeSector(true);
            e.setApellido("Gomez");
            e.setNombre("Francisco");
            e.setDni(12345678);
            e.setCorreo("fgomez@sistemas.com");
            e.setDomicilio("Av. Corrientes 2222, CABA");
            e.setFechaNacimiento(LocalDate.of(1980, 3, 16));
            e.setFechaContratacion(LocalDate.of(2016, 5, 10));
            e.setTelefono("11-5678-1234");

            guardarEmpleadoConHistorial.apply(e, desarrolladorBack);
        }

        Empleado supervisorBackend = repositorioEmpleados.findByDni(12345678).get();

        // Desarrolladora
        if (repositorioEmpleados.findByDni(98765432).isEmpty()) {

            Empleado e = new Empleado();
            e.setPuesto(desarrolladorBack);
            e.setSupervisor(supervisorBackend);
            e.setEsSupervisorDeSector(false);
            e.setApellido("López");
            e.setNombre("María");
            e.setDni(98765432);
            e.setCorreo("mlopez@sistemas.com");
            e.setDomicilio("Calle Falsa 123, CABA");
            e.setFechaNacimiento(LocalDate.of(1992, 11, 5));
            e.setFechaContratacion(LocalDate.of(2020, 8, 10));
            e.setTelefono("11-2222-3333");

            guardarEmpleadoConHistorial.apply(e, desarrolladorBack);
        }

        // ====================================================
        //                CONTABILIDAD
        // ====================================================

        if (repositorioEmpleados.findByDni(22333444).isEmpty()) {
            Empleado e = new Empleado();
            e.setPuesto(contadorSenior);
            e.setSupervisor(null);
            e.setEsSupervisorDeSector(true);
            e.setApellido("Pérez");
            e.setNombre("Carolina");
            e.setDni(22333444);
            e.setCorreo("cperez@empresa.com");
            e.setDomicilio("Italia 123, CABA");
            e.setFechaNacimiento(LocalDate.of(1978, 2, 20));
            e.setFechaContratacion(LocalDate.of(2010, 1, 15));
            e.setTelefono("11-3333-4444");

            guardarEmpleadoConHistorial.apply(e, contadorSenior);
        }

        Empleado jefeContab = repositorioEmpleados.findByDni(22333444).get();

        if (repositorioEmpleados.findByDni(33444555).isEmpty()) {

            Empleado e = new Empleado();
            e.setPuesto(analistaContable);
            e.setSupervisor(jefeContab);
            e.setEsSupervisorDeSector(false);
            e.setApellido("Rodríguez");
            e.setNombre("Javier");
            e.setDni(33444555);
            e.setCorreo("jrodriguez@empresa.com");
            e.setDomicilio("Lavalle 567, CABA");
            e.setFechaNacimiento(LocalDate.of(1988, 7, 30));
            e.setFechaContratacion(LocalDate.of(2018, 4, 2));
            e.setTelefono("11-4444-5555");

            guardarEmpleadoConHistorial.apply(e, analistaContable);
        }

        // ====================================================
        //              VENTAS NACIONALES
        // ====================================================
        if (repositorioEmpleados.findByDni(44555666).isEmpty()) {

            Empleado e = new Empleado();
            e.setPuesto(jefeVentas);
            e.setSupervisor(null);
            e.setEsSupervisorDeSector(true);
            e.setApellido("Martínez");
            e.setNombre("Sofía");
            e.setDni(44555666);
            e.setCorreo("smartinez@empresa.com");
            e.setDomicilio("Belgrano 890, Córdoba");
            e.setFechaNacimiento(LocalDate.of(1983, 9, 10));
            e.setFechaContratacion(LocalDate.of(2012, 6, 1));
            e.setTelefono("351-555-6677");

            guardarEmpleadoConHistorial.apply(e, jefeVentas);
        }

        Empleado jefeVentasNac = repositorioEmpleados.findByDni(44555666).get();

        if (repositorioEmpleados.findByDni(55666777).isEmpty()) {

            Empleado e = new Empleado();
            e.setPuesto(vendedor);
            e.setSupervisor(jefeVentasNac);
            e.setEsSupervisorDeSector(false);
            e.setApellido("Giménez");
            e.setNombre("Diego");
            e.setDni(55666777);
            e.setCorreo("dgimenez@empresa.com");
            e.setDomicilio("San Juan 321, Córdoba");
            e.setFechaNacimiento(LocalDate.of(1990, 1, 25));
            e.setFechaContratacion(LocalDate.of(2019, 9, 15));
            e.setTelefono("351-111-2222");

            guardarEmpleadoConHistorial.apply(e, vendedor);
        }

        // ====================================================
        //                       RRHH
        // ====================================================

        if (repositorioEmpleados.findByDni(66777888).isEmpty()) {
            Empleado e = new Empleado();
            e.setPuesto(jefeRRHH);
            e.setSupervisor(null);
            e.setEsSupervisorDeSector(true);
            e.setApellido("Suárez");
            e.setNombre("Valeria");
            e.setDni(66777888);
            e.setCorreo("vsuarez@empresa.com");
            e.setDomicilio("Mitre 456, Rosario");
            e.setFechaNacimiento(LocalDate.of(1982, 4, 5));
            e.setFechaContratacion(LocalDate.of(2011, 11, 20));
            e.setTelefono("341-222-3344");

            guardarEmpleadoConHistorial.apply(e, jefeRRHH);
        }

        Empleado jefeRRHHEmp = repositorioEmpleados.findByDni(66777888).get();

        if (repositorioEmpleados.findByDni(77888999).isEmpty()) {

            Empleado e = new Empleado();
            e.setPuesto(analistaRRHH);
            e.setSupervisor(jefeRRHHEmp);
            e.setEsSupervisorDeSector(false);
            e.setApellido("Navarro");
            e.setNombre("Axel");
            e.setDni(77888999);
            e.setCorreo("anavarro@empresa.com");
            e.setDomicilio("Pellegrini 999, Rosario");
            e.setFechaNacimiento(LocalDate.of(1995, 10, 12));
            e.setFechaContratacion(LocalDate.of(2022, 2, 1));
            e.setTelefono("341-999-8888");

            guardarEmpleadoConHistorial.apply(e, analistaRRHH);
        }

        // ====================================================
        //                       PRODUCCIÓN
        // ====================================================

        if (repositorioEmpleados.findByDni(88999000).isEmpty()) {

            Empleado e = new Empleado();
            e.setPuesto(supervisorPlanta);
            e.setSupervisor(null);
            e.setEsSupervisorDeSector(true);
            e.setApellido("Castro");
            e.setNombre("Hernán");
            e.setDni(88999000);
            e.setCorreo("hcastro@empresa.com");
            e.setDomicilio("Ruta 9 km 50, Planta 1");
            e.setFechaNacimiento(LocalDate.of(1975, 12, 3));
            e.setFechaContratacion(LocalDate.of(2005, 3, 10));
            e.setTelefono("11-7777-8888");

            guardarEmpleadoConHistorial.apply(e, supervisorPlanta);
        }

        Empleado supervisorPlantaEmp = repositorioEmpleados.findByDni(88999000).get();

        if (repositorioEmpleados.findByDni(90001111).isEmpty()) {

            Empleado e = new Empleado();
            e.setPuesto(operario);
            e.setSupervisor(supervisorPlantaEmp);
            e.setEsSupervisorDeSector(false);
            e.setApellido("Ríos");
            e.setNombre("Matías");
            e.setDni(90001111);
            e.setCorreo("mrios@empresa.com");
            e.setDomicilio("Barrio Industrial s/n");
            e.setFechaNacimiento(LocalDate.of(1993, 6, 18));
            e.setFechaContratacion(LocalDate.of(2021, 7, 5));
            e.setTelefono("11-6666-7777");

            guardarEmpleadoConHistorial.apply(e, operario);
        }
    }
}
