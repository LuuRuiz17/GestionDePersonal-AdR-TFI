package com.adminrec.tfi.util.mappers;

import com.adminrec.tfi.entities.Sector;
import com.adminrec.tfi.util.dtos.entities.DetalleSectorDTO;
import com.adminrec.tfi.util.dtos.entities.SectorDTO;

public class SectorMapper {

    public static SectorDTO toDTO(Sector sector) {
        SectorDTO dto = new SectorDTO();
        dto.setId(sector.getId());
        dto.setNombre(sector.getNombre());
        return dto;
    }

    public static DetalleSectorDTO toDetalleDTO(Sector sector) {
        DetalleSectorDTO dto = new DetalleSectorDTO();

        dto.setId(sector.getId());
        dto.setNombre(sector.getNombre());
        dto.setPuestos(sector.getPuestos().stream().map(PuestoMapper::toDetalleDTO).toList());

        return dto;
    }

    public static Sector fromDTO(SectorDTO dto) {
        Sector sector = new Sector();

        if (dto != null) {
            sector.setId(dto.getId());
            sector.setNombre(dto.getNombre());
        }

        return sector;
    }
}
