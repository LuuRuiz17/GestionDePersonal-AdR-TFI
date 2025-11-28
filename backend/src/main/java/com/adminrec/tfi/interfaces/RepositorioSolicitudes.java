package com.adminrec.tfi.interfaces;

import com.adminrec.tfi.entities.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepositorioSolicitudes extends JpaRepository<Solicitud, Long> {
    List<Solicitud> findAllByEmpleado_Dni(Integer dni);
    List<Solicitud> findAllByEmpleado_Puesto_Sector_Id(Long idSector);
}
