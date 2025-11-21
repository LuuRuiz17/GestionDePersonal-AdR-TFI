package com.adminrec.tfi.util.mappers;

import com.adminrec.tfi.entities.Asistencia;
import com.adminrec.tfi.util.dtos.entities.AsistenciaDTO;

public class AsistenciaMapper {
    public static AsistenciaDTO toDTO(Asistencia asistencia) {
        AsistenciaDTO dto = new AsistenciaDTO();

        dto.setId(asistencia.getId());
        dto.setFecha(asistencia.getCreadoEn().toLocalDate());

        return dto;
    }
}
