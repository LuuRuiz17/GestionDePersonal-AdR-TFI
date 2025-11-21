package com.adminrec.tfi.util.mappers;

import com.adminrec.tfi.entities.Solicitud;
import com.adminrec.tfi.util.dtos.entities.SolicitudDTO;
import com.adminrec.tfi.util.enums.EstadoSolicitud;
import com.adminrec.tfi.util.enums.TipoSolicitud;

public class SolicitudMapper {
    public static SolicitudDTO toDTO(Solicitud solicitud) {
        SolicitudDTO dto = new SolicitudDTO();

        dto.setId(solicitud.getId());
        dto.setTipoSolicitud(solicitud.getTipoSolicitud().name());
        dto.setDuracionDias(solicitud.getDuracionDias());
        dto.setMotivo(solicitud.getMotivo());
        dto.setEstadoSolicitud(solicitud.getEstadoSolicitud().name());
        dto.setEmpleado(EmpleadoMapper.toDTO(solicitud.getEmpleado()));

        return dto;
    }

    public static Solicitud fromDTO(SolicitudDTO dto) {
        Solicitud solicitud = new Solicitud();

        solicitud.setTipoSolicitud(TipoSolicitud.desdeString(dto.getTipoSolicitud()));
        solicitud.setDuracionDias(dto.getDuracionDias());
        solicitud.setMotivo(dto.getMotivo());

        if (dto.getEstadoSolicitud() != null) {
            solicitud.setEstadoSolicitud(EstadoSolicitud.desdeString(dto.getEstadoSolicitud()));
        }

        if (dto.getEmpleado() != null) {
            solicitud.setEmpleado(EmpleadoMapper.fromDTO(dto.getEmpleado()));
        }

        return solicitud;
    }
}
