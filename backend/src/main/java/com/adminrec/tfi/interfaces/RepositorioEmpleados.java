package com.adminrec.tfi.interfaces;

import com.adminrec.tfi.entities.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RepositorioEmpleados extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByDni(int dni);
}
