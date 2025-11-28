package com.adminrec.tfi.util.dataLoaders;

import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.entities.Solicitud;
import com.adminrec.tfi.interfaces.RepositorioEmpleados;
import com.adminrec.tfi.interfaces.RepositorioSolicitudes;
import com.adminrec.tfi.util.enums.EstadoSolicitud;
import com.adminrec.tfi.util.enums.TipoSolicitud;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
@Order(6)
public class SolicitudesDataLoader implements CommandLineRunner {
    private final RepositorioSolicitudes repositorioSolicitudes;
    private final RepositorioEmpleados repositorioEmpleados;
    private final Random random = new Random();

    public SolicitudesDataLoader(
            RepositorioSolicitudes repositorioSolicitudes,
            RepositorioEmpleados repositorioEmpleados
    ) {
        this.repositorioSolicitudes = repositorioSolicitudes;
        this.repositorioEmpleados = repositorioEmpleados;
    }

    @Override
    public void run(String... args) {
        if (repositorioSolicitudes.count() > 0) return;

        List<Empleado> empleados = repositorioEmpleados.findAll();

        empleados.stream()
                .filter(empleado -> !empleado.isEsSupervisorDeSector())
                .forEach(this::generarSolicitudesAleatorias);
    }

    private void generarSolicitudesAleatorias(Empleado empleado) {
        int cantidad = 1 + random.nextInt(3);

        for (int i = 0; i < cantidad; i++) {
            Solicitud solicitud = new Solicitud();
            solicitud.setEmpleado(empleado);

            TipoSolicitud tipo = TipoSolicitud.values()[random.nextInt(TipoSolicitud.values().length)];
            solicitud.setTipoSolicitud(tipo);

            solicitud.setDuracionDias(generarDuracion(tipo));
            solicitud.setMotivo(generarMotivo(tipo));

            solicitud.setEstadoSolicitud(EstadoSolicitud.PENDIENTE);
            repositorioSolicitudes.save(solicitud);
        }
    }

    private int generarDuracion(TipoSolicitud tipo) {
        return switch (tipo) {
            case VACACIONES -> 7 + random.nextInt(8);
            case PERMISO -> 1 + random.nextInt(2);
            case LICENCIA -> 3 + random.nextInt(10);
        };
    }

    private String generarMotivo(TipoSolicitud tipo) {
        return switch (tipo) {
            case VACACIONES -> "Vacaciones solicitadas por descanso anual.";
            case PERMISO -> "Permiso por asunto personal.";
            case LICENCIA -> "Solicitud de licencia por razones particulares.";
        };
    }
}
