package com.adminrec.tfi.util.dataLoaders;

import com.adminrec.tfi.entities.Sector;
import com.adminrec.tfi.interfaces.RepositorioSectores;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class SectorDataLoader implements CommandLineRunner {
    private final RepositorioSectores repositorioSectores;

    public SectorDataLoader(RepositorioSectores repositorioSectores) {
        this.repositorioSectores = repositorioSectores;
    }

    @Override
    public void run(String... args) throws Exception {
        String[] sectores = { "Sistemas", "Contabilidad", "Ventas Nacionales", "Recursos Humanos", "Producción" };

        for (String sector : sectores) {
            crearSectorSiNoExiste(sector);
        }
    }

    private void crearSectorSiNoExiste(String nombre) {
        if (repositorioSectores.findByNombre(nombre).isEmpty()) {
            Sector sector = new Sector();
            sector.setNombre(nombre);
            repositorioSectores.save(sector);
        }
    }
}
