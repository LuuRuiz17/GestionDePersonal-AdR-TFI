package com.adminrec.tfi.interfaces;

import com.adminrec.tfi.entities.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorioAsistencia extends JpaRepository<Asistencia, Long> {
    List<Asistencia> findAllByEmpleado_DniAndCreadoEnBetween(Integer empleadoDni, LocalDateTime fechaInicio, LocalDateTime fechaFin);
    List<Asistencia> findAllByEmpleado_Dni(Integer empleadoDni);
}
