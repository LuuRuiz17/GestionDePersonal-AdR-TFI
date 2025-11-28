package com.adminrec.tfi.util.dataLoaders;

import com.adminrec.tfi.entities.Puesto;
import com.adminrec.tfi.entities.Sector;
import com.adminrec.tfi.interfaces.RepositorioPuestos;
import com.adminrec.tfi.interfaces.RepositorioSectores;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class PuestoDataLoader implements CommandLineRunner {
    private final RepositorioPuestos repositorioPuestos;
    private final RepositorioSectores repositorioSectores;

    public PuestoDataLoader(RepositorioPuestos repositorioPuestos, RepositorioSectores repositorioSectores) {
        this.repositorioPuestos = repositorioPuestos;
        this.repositorioSectores = repositorioSectores;
    }

    @Override
    public void run(String... args) {
        String[] sectores = { "Sistemas", "Contabilidad", "Ventas Nacionales", "Recursos Humanos", "Producción" };
        String[][] puestos = {
                {"Líder Técnico", "Desarrollador Backend", "Soporte Técnico"},
                {"Contador Senior", "Analista Contable"},
                {"Jefe de Ventas", "Vendedor"},
                {"Jefe de RRHH", "Analista de RRHH"},
                {"Supervisor de Planta", "Operario"}
        };


        Sector sistemas = repositorioSectores.findByNombre(sectores[0]).get();
        Sector contabilidad = repositorioSectores.findByNombre(sectores[1]).get();
        Sector ventasNacional = repositorioSectores.findByNombre(sectores[2]).get();
        Sector rrhh =  repositorioSectores.findByNombre(sectores[3]).get();
        Sector produccion = repositorioSectores.findByNombre(sectores[4]).get();

        crearPuestoSiNoExiste(puestos[0][0], sistemas, 15D, 6D);
        crearPuestoSiNoExiste(puestos[0][1], sistemas, 10D, 8D);
        crearPuestoSiNoExiste(puestos[0][2], sistemas, 8D, 8D);
        crearPuestoSiNoExiste(puestos[1][0], contabilidad, 13D, 5D);
        crearPuestoSiNoExiste(puestos[1][1], contabilidad, 9D, 5D);
        crearPuestoSiNoExiste(puestos[2][0], ventasNacional, 14D, 8D);
        crearPuestoSiNoExiste(puestos[2][1], ventasNacional, 8D, 8D);
        crearPuestoSiNoExiste(puestos[3][0], rrhh, 13D, 8D);
        crearPuestoSiNoExiste(puestos[3][1], rrhh, 9D, 6D);
        crearPuestoSiNoExiste(puestos[4][0], produccion, 12D, 8D);
        crearPuestoSiNoExiste(puestos[4][1], produccion, 7D, 8D);
    }

    private void crearPuestoSiNoExiste(String nombre, Sector sector, Double precio, Double horasMinimas) {
        if (repositorioPuestos.findByNombreAndSector(nombre, sector).isEmpty()) {
            Puesto p = new Puesto();
            p.setNombre(nombre);
            p.setSector(sector);
            p.setValorHora(precio);
            p.setHorasMinimasTrabajoDiario(horasMinimas);
            repositorioPuestos.save(p);
        }
    }
}
