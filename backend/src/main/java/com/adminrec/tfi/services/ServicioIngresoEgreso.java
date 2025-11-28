package com.adminrec.tfi.services;

import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.exceptions.EmpleadoInexistenteException;
import com.adminrec.tfi.interfaces.RepositorioEmpleados;
import com.adminrec.tfi.interfaces.RepositorioIngresoEgreso;
import com.adminrec.tfi.util.dtos.entities.IngresoEgresoDTO;
import com.adminrec.tfi.util.mappers.IngresoEgresoMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicioIngresoEgreso {
    private final RepositorioIngresoEgreso repositorioIngresoEgreso;
    private final RepositorioEmpleados repositorioEmpleados;

    public ServicioIngresoEgreso(RepositorioIngresoEgreso repositorioIngresoEgreso, RepositorioEmpleados repositorioEmpleados) {
        this.repositorioIngresoEgreso = repositorioIngresoEgreso;
        this.repositorioEmpleados = repositorioEmpleados;
    }

    public List<IngresoEgresoDTO> listarParaElEmpleado(Long id) {
        Empleado empleado = repositorioEmpleados.findById(id).orElseThrow(
                () -> new EmpleadoInexistenteException("El empleado con el id " + id + " no existe")
        );

        return repositorioIngresoEgreso
                .findAllByEmpleado_Id(id)
                .stream()
                .map(IngresoEgresoMapper::toDTO)
                .toList();
    }

    public void eliminarIngresoEgreso(Long id) {}
}
