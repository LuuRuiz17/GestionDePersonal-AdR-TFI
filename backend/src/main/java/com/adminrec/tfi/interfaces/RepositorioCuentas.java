package com.adminrec.tfi.interfaces;

import com.adminrec.tfi.entities.Cuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositorioCuentas extends JpaRepository<Cuenta, Long> {
    Cuenta findByEmpleado_Dni(Integer dni);
    boolean existsByEmpleado_Dni(Integer dni);
}
