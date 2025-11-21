package com.adminrec.tfi.interfaces;

import com.adminrec.tfi.entities.IngresoEgreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepositorioIngresoEgreso extends JpaRepository<IngresoEgreso, Long> {
    IngresoEgreso findTopByEmpleado_DniOrderByCreadoEnDesc(Integer dni);
    List<IngresoEgreso> findAllByEmpleado_Id(Long id);
}
