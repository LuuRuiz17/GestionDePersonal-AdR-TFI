package com.adminrec.tfi.util.mappers;

import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.util.dtos.entities.DetalleEmpleadoDTO;
import com.adminrec.tfi.util.dtos.entities.EmpleadoDTO;

public class EmpleadoMapper {
    public static EmpleadoDTO toDTO(Empleado empleado) {
        EmpleadoDTO dto = new EmpleadoDTO();

        dto.setId(empleado.getId());
        dto.setApellido(empleado.getApellido());
        dto.setNombre(empleado.getNombre());
        dto.setDni(empleado.getDni());
        dto.setCorreo(empleado.getCorreo());
        dto.setDomicilio(empleado.getDomicilio());
        dto.setFechaNacimiento(empleado.getFechaNacimiento());
        dto.setFechaContratacion(empleado.getFechaContratacion());
        dto.setTelefono(empleado.getTelefono());

        if (empleado.getPuesto() != null) {
            dto.setPuesto(PuestoMapper.toDTO(empleado.getPuesto()));
        }

        return dto;
    }

    public static DetalleEmpleadoDTO toDetalleDTO(Empleado empleado) {
        DetalleEmpleadoDTO dto = new DetalleEmpleadoDTO();

        dto.setId(empleado.getId());
        dto.setApellido(empleado.getApellido());
        dto.setNombre(empleado.getNombre());
        dto.setDni(empleado.getDni());
        dto.setCorreo(empleado.getCorreo());
        dto.setDomicilio(empleado.getDomicilio());
        dto.setFechaNacimiento(empleado.getFechaNacimiento());
        dto.setFechaContratacion(empleado.getFechaContratacion());
        dto.setTelefono(empleado.getTelefono());
        dto.setEsSupervisorDeSector(empleado.isEsSupervisorDeSector());

        if (empleado.getSupervisor() != null) {
            dto.setSupervisor(EmpleadoMapper.toDetalleDTO(empleado.getSupervisor()));
        }

        return dto;
    }

    public static Empleado fromDTO(EmpleadoDTO dto) {
        Empleado empleado = new Empleado();

        empleado.setApellido(dto.getApellido());
        empleado.setNombre(dto.getNombre());
        empleado.setDni(dto.getDni());
        empleado.setCorreo(dto.getCorreo());
        empleado.setDomicilio(dto.getDomicilio());
        empleado.setFechaNacimiento(dto.getFechaNacimiento());
        empleado.setFechaContratacion(dto.getFechaContratacion());
        empleado.setTelefono(dto.getTelefono());

        if (dto.getPuesto() != null) {
            empleado.setPuesto(PuestoMapper.fromDTO(dto.getPuesto()));
        }

        return empleado;
    }
}
