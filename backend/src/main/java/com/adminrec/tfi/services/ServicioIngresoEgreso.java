package com.adminrec.tfi.services;

import com.adminrec.tfi.interfaces.RepositorioIngresoEgreso;
import org.springframework.stereotype.Service;

@Service
public class ServicioIngresoEgreso {
    private final RepositorioIngresoEgreso repositorioIngresoEgreso;

    public ServicioIngresoEgreso(RepositorioIngresoEgreso repositorioIngresoEgreso) {
        this.repositorioIngresoEgreso = repositorioIngresoEgreso;
    }

    public void eliminarIngresoEgreso(Long id) {}
}
