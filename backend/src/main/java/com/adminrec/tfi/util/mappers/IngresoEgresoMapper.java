package com.adminrec.tfi.util.mappers;

import com.adminrec.tfi.entities.IngresoEgreso;
import com.adminrec.tfi.util.dtos.entities.IngresoEgresoDTO;

public class IngresoEgresoMapper {
    public static IngresoEgresoDTO toDTO(IngresoEgreso entity) {
        IngresoEgresoDTO dto = new IngresoEgresoDTO();

        dto.setId(entity.getId());
        dto.setNombreCompleto(entity.getEmpleado().getApellido() + ", " + entity.getEmpleado().getNombre());
        dto.setDni(entity.getEmpleado().getDni());
        dto.setNombrePuesto(entity.getPuesto().getNombre());
        dto.setNombreSector(entity.getPuesto().getSector().getNombre());
        dto.setFechaIngreso(entity.getCreadoEn());
        dto.setFechaSalida(entity.getActualizadoEn());

        return dto;
    }
}
