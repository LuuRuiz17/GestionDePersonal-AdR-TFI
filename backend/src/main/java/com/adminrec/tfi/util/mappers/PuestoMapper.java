package com.adminrec.tfi.util.mappers;

import com.adminrec.tfi.entities.Puesto;
import com.adminrec.tfi.util.dtos.entities.DetallePuestoDTO;
import com.adminrec.tfi.util.dtos.entities.PuestoDTO;

public class PuestoMapper {
    public static PuestoDTO toDTO(Puesto puesto) {
        PuestoDTO dto = new PuestoDTO();

        if (puesto != null) {
            dto.setId(puesto.getId());
            dto.setNombre(puesto.getNombre());
            dto.setSector(SectorMapper.toDTO(puesto.getSector()));
            dto.setValorHora(puesto.getValorHora());
            dto.setHorasMinimasTrabajoDiario(puesto.getHorasMinimasTrabajoDiario());
        }

        return dto;
    }

    public static DetallePuestoDTO toDetalleDTO(Puesto puesto) {
        DetallePuestoDTO dto = new DetallePuestoDTO();

        dto.setId(puesto.getId());
        dto.setNombre(puesto.getNombre());
        dto.setEmpleados(puesto.getEmpleados().stream().map(EmpleadoMapper::toDetalleDTO).toList());

        return dto;
    }

    public static Puesto fromDTO(PuestoDTO dto) {
        Puesto puesto = new Puesto();

        if (dto != null) {
            puesto.setNombre(dto.getNombre());
            puesto.setSector(SectorMapper.fromDTO(dto.getSector()));
            puesto.setValorHora(dto.getValorHora());
            puesto.setHorasMinimasTrabajoDiario(dto.getHorasMinimasTrabajoDiario());
        }

        return puesto;
    }
}
