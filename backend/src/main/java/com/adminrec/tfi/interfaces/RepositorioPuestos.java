package com.adminrec.tfi.interfaces;

import com.adminrec.tfi.entities.Puesto;
import com.adminrec.tfi.entities.Sector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositorioPuestos extends JpaRepository<Puesto, Long> {
    Optional<Puesto> findByNombreAndSector(String nombre, Sector sector);

}
