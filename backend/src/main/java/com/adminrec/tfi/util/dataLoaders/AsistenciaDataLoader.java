package com.adminrec.tfi.util.dataLoaders;

import com.adminrec.tfi.entities.Asistencia;
import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.interfaces.RepositorioAsistencia;
import com.adminrec.tfi.interfaces.RepositorioEmpleados;
import com.adminrec.tfi.util.mappers.AsistenciaMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Component
@Order(5)
public class AsistenciaDataLoader implements CommandLineRunner {
    private final RepositorioAsistencia repositorioAsistencias;
    private final RepositorioEmpleados repositorioEmpleados;
    private static final Set<LocalDate> FERIADOS = Set.of(
            // ---- ENERO ----
            LocalDate.of(2025, 1, 1),     // Año Nuevo

            // ---- FEBRERO / MARZO ----
            LocalDate.of(2025, 3, 3),     // Carnaval
            LocalDate.of(2025, 3, 4),     // Carnaval
            LocalDate.of(2025, 3, 24),    // Día de la Memoria
            LocalDate.of(2025, 4, 18),    // Viernes Santo
            LocalDate.of(2025, 4, 2),     // Veteranos Malvinas

            // ---- MAYO ----
            LocalDate.of(2025, 5, 1),     // Día del Trabajador
            LocalDate.of(2025, 5, 25),    // Revolución de Mayo

            // ---- JUNIO ----
            LocalDate.of(2025, 6, 17),    // Paso a la inmortalidad de Güemes
            LocalDate.of(2025, 6, 20),    // Belgrano

            // ---- JULIO ----
            LocalDate.of(2025, 7, 9),     // Independencia

            // ---- AGOSTO ----
            LocalDate.of(2025, 8, 17),    // San Martín

            // ---- OCTUBRE ----
            LocalDate.of(2025, 10, 12),   // Diversidad Cultural

            // ---- NOVIEMBRE ----
            LocalDate.of(2025, 11, 20),   // Soberanía Nacional

            // ---- DICIEMBRE ----
            LocalDate.of(2025, 12, 8),    // Inmaculada Concepción
            LocalDate.of(2025, 12, 25)    // Navidad
    );


    public AsistenciaDataLoader(RepositorioAsistencia repositorioAsistencias, RepositorioEmpleados repositorioEmpleados) {
        this.repositorioAsistencias = repositorioAsistencias;
        this.repositorioEmpleados = repositorioEmpleados;
    }

    @Override
    public void run(String... args) throws Exception {
        LocalDate inicio = LocalDate.now().minusDays(60);
        LocalDate fin = LocalDate.now();

        if (repositorioAsistencias.count() > 0) return;

        List<Empleado> empleados = repositorioEmpleados.findAll();

        for (Empleado empleado : empleados) {
            generarAsistencia(empleado, inicio, fin);
        }
    }

    private void generarAsistencia(Empleado empleado, LocalDate inicio, LocalDate fin) {
        for (LocalDate fecha = inicio; !fecha.isAfter(fin); fecha = fecha.plusDays(1)) {
            if (!esDiaLaborable(fecha)) continue;

            LocalDateTime inicioDia = fecha.atStartOfDay();
            LocalDateTime finDia = fecha.atStartOfDay().plusDays(1).minusSeconds(1);

            boolean yaExiste = !repositorioAsistencias
                    .findAllByEmpleado_DniAndCreadoEnBetween(
                            empleado.getDni(),
                            inicioDia,
                            finDia
                    ).isEmpty();

            if (yaExiste) continue;

            int horaEntrada = 8 + (int) (Math.random() * 2);
            int minutosEntrada = (int) (Math.random() * 60);

            Asistencia asistencia = new Asistencia();
            asistencia.setEmpleado(empleado);
            asistencia.setCreadoEn(fecha.atTime(horaEntrada, minutosEntrada));

            repositorioAsistencias.save(asistencia);
        }
    }

    private boolean esDiaLaborable(LocalDate fecha) {
        return !(fecha.getDayOfWeek() == DayOfWeek.SATURDAY ||
                fecha.getDayOfWeek() == DayOfWeek.SUNDAY ||
                FERIADOS.contains(fecha));
    }
}
