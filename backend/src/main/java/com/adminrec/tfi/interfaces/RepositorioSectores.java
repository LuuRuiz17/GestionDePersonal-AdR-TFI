package com.adminrec.tfi.interfaces;

import com.adminrec.tfi.entities.Sector;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RepositorioSectores extends JpaRepository<Sector, Long> {
    Optional<Sector> findByNombre(String nombre);
}
