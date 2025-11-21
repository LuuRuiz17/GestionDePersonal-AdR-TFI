package com.adminrec.tfi.services;

import com.adminrec.tfi.entities.Puesto;
import com.adminrec.tfi.entities.Sector;
import com.adminrec.tfi.exceptions.PuestoInexistenteException;
import com.adminrec.tfi.exceptions.SectorInexistenteException;
import com.adminrec.tfi.interfaces.RepositorioPuestos;
import com.adminrec.tfi.interfaces.RepositorioSectores;
import com.adminrec.tfi.util.dtos.entities.PuestoDTO;
import com.adminrec.tfi.util.mappers.PuestoMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServicioPuesto {
    private final RepositorioPuestos repositorioPuestos;
    private final RepositorioSectores repositorioSectores;

    public ServicioPuesto(RepositorioPuestos repositorioPuestos, RepositorioSectores repositorioSectores) {
        this.repositorioPuestos = repositorioPuestos;
        this.repositorioSectores = repositorioSectores;
    }

    public List<PuestoDTO> listar() {
        return repositorioPuestos.findAll()
                .stream()
                .filter(p -> p.getBorradoEn() == null)
                .map(PuestoMapper::toDTO)
                .toList();
    }

    public PuestoDTO buscarUno(Long id) {
        Puesto puesto = repositorioPuestos.findById(id).orElseThrow(
                () -> new PuestoInexistenteException("El puesto con el id " + id + " no existe")
        );

        return PuestoMapper.toDTO(puesto);
    }

    public PuestoDTO crear(PuestoDTO dto) {
        Puesto puesto = PuestoMapper.fromDTO(dto);
        Sector sector = repositorioSectores.findById(dto.getSector().getId()).orElseThrow(
                () -> new SectorInexistenteException("El sector con el id " + dto.getSector().getId() + " no existe")
        );

        puesto.setSector(sector);

        repositorioPuestos.save(puesto);

        return PuestoMapper.toDTO(puesto);
    }

    public PuestoDTO editar(Long id, PuestoDTO dto) {
        Puesto puesto = repositorioPuestos.findById(id).orElseThrow(
                () -> new PuestoInexistenteException("El puesto con el id " +  id + " no existe")
        );

        Sector sector = repositorioSectores.findById(dto.getSector().getId()).orElseThrow(
                () -> new SectorInexistenteException("El sector con el id " + dto.getSector().getId() + " no existe")
        );

        puesto.setNombre(dto.getNombre());
        puesto.setValorHora(dto.getValorHora());
        puesto.setSector(sector);

        repositorioPuestos.save(puesto);

        return PuestoMapper.toDTO(puesto);
    }

    public PuestoDTO eliminar(Long id) {
        Puesto puesto = repositorioPuestos.findById(id).orElseThrow(
                () -> new PuestoInexistenteException("El puesto con el id " +  id + " no existe")
        );

        puesto.setBorradoEn(LocalDateTime.now());
        repositorioPuestos.save(puesto);

        return PuestoMapper.toDTO(puesto);
    }
}
