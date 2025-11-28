package com.adminrec.tfi.services;

import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.entities.IngresoEgreso;
import com.adminrec.tfi.entities.Puesto;
import com.adminrec.tfi.exceptions.EmpleadoInexistenteException;
import com.adminrec.tfi.exceptions.PuestoInexistenteException;
import com.adminrec.tfi.interfaces.RepositorioEmpleados;
import com.adminrec.tfi.interfaces.RepositorioIngresoEgreso;
import com.adminrec.tfi.interfaces.RepositorioPuestos;
import com.adminrec.tfi.util.dtos.entities.AsistenciaDTO;
import com.adminrec.tfi.util.dtos.entities.EmpleadoDTO;
import com.adminrec.tfi.util.mappers.AsistenciaMapper;
import com.adminrec.tfi.util.mappers.EmpleadoMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServicioEmpleado {
    private final RepositorioEmpleados repositorioEmpleados;
    private final RepositorioPuestos repositorioPuestos;
    private final RepositorioIngresoEgreso repositorioIngresoEgreso;
    private final ServicioCuenta servicioCuenta;

    public ServicioEmpleado(
            RepositorioEmpleados repositorioEmpleados,
            RepositorioPuestos repositorioPuestos,
            RepositorioIngresoEgreso repositorioIngresoEgreso,
            ServicioCuenta servicioCuenta
    ) {
        this.repositorioEmpleados = repositorioEmpleados;
        this.repositorioPuestos = repositorioPuestos;
        this.repositorioIngresoEgreso = repositorioIngresoEgreso;
        this.servicioCuenta = servicioCuenta;
    }

    public List<EmpleadoDTO> listar() {
        return repositorioEmpleados.findAll()
                .stream()
                .filter(e -> e.getBorradoEn() == null)
                .map(EmpleadoMapper::toDTO)
                .toList();
    }

    public EmpleadoDTO buscarUno(Long id) {
        Empleado empleado = repositorioEmpleados.findById(id).orElseThrow(
                () -> new EmpleadoInexistenteException("El empleado con id " + id + " no existe")
        );

        return EmpleadoMapper.toDTO(empleado);
    }

    public EmpleadoDTO crear(EmpleadoDTO dto, String contrasena) {
        Empleado empleado = EmpleadoMapper.fromDTO(dto);

        Puesto puesto = repositorioPuestos.findById(dto.getPuesto().getId()).orElseThrow(
                () -> new PuestoInexistenteException("El puesto con id " + dto.getPuesto().getId() + " no existe")
        );

        empleado.setPuesto(puesto);

        // Datos adicionales necesarios
        empleado.setSupervisor(null);
        empleado.setEsSupervisorDeSector(false);

        repositorioEmpleados.save(empleado);

        EmpleadoDTO nuevoEmpleadoDTO = EmpleadoMapper.toDTO(empleado);
        nuevoEmpleadoDTO.setId(empleado.getId());

        IngresoEgreso ingresoEgreso = new IngresoEgreso();
        ingresoEgreso.setEmpleado(empleado);
        ingresoEgreso.setPuesto(puesto);
        ingresoEgreso.setCreadoEn(LocalDate.now());
        repositorioIngresoEgreso.save(ingresoEgreso);

        servicioCuenta.registrar(empleado.getDni(), contrasena);

        return nuevoEmpleadoDTO;
    }

    public EmpleadoDTO editar(Long id, EmpleadoDTO dto) {
        Empleado empleado = repositorioEmpleados.findById(id).orElseThrow(
                () -> new EmpleadoInexistenteException("El empleado con id " + id + " no existe")
        );

        Puesto primerPuesto = empleado.getPuesto();

        Puesto puesto = repositorioPuestos.findById(dto.getPuesto().getId()).orElseThrow(
                () -> new PuestoInexistenteException("El puesto con id " + dto.getPuesto().getId() + " no existe")
        );

        empleado.setApellido(dto.getApellido());
        empleado.setNombre(dto.getNombre());
        empleado.setDni(dto.getDni());
        empleado.setCorreo(dto.getCorreo());
        empleado.setDomicilio(dto.getDomicilio());
        empleado.setFechaNacimiento(dto.getFechaNacimiento());
        empleado.setFechaContratacion(dto.getFechaContratacion());
        empleado.setTelefono(dto.getTelefono());
        empleado.setPuesto(puesto);

        repositorioEmpleados.save(empleado);

        if (!primerPuesto.getId().equals(puesto.getId())) {
            IngresoEgreso ultimoIE =
                    repositorioIngresoEgreso.findTopByEmpleado_DniOrderByCreadoEnDesc(empleado.getDni());

            if (ultimoIE != null) {
                ultimoIE.setActualizadoEn(LocalDate.now());
                repositorioIngresoEgreso.save(ultimoIE);

                IngresoEgreso nuevoIE = new IngresoEgreso();
                nuevoIE.setEmpleado(empleado);
                nuevoIE.setPuesto(puesto);
                nuevoIE.setCreadoEn(LocalDate.now());
                repositorioIngresoEgreso.save(nuevoIE);
            }
        }

        return EmpleadoMapper.toDTO(empleado);
    }

    public EmpleadoDTO eliminar(Long id) {
        Empleado empleado = repositorioEmpleados.findById(id).orElseThrow(
                () -> new EmpleadoInexistenteException("El empleado con id " + id + " no existe")
        );

        empleado.setBorradoEn(LocalDateTime.now());
        repositorioEmpleados.save(empleado);

        return EmpleadoMapper.toDTO(empleado);
    }

    public List<AsistenciaDTO> obtenerAsistencias(Long id) {
        Empleado empleado = repositorioEmpleados.findById(id).orElseThrow(
                () -> new EmpleadoInexistenteException("El empleado con id " + id + " no existe")
        );

        return empleado.getAsistencias().stream().map(AsistenciaMapper::toDTO).toList();
    }
}
