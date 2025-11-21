package com.adminrec.tfi.services;

import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.entities.Solicitud;
import com.adminrec.tfi.exceptions.EmpleadoInexistenteException;
import com.adminrec.tfi.exceptions.SolicitudInexistenteException;
import com.adminrec.tfi.interfaces.RepositorioEmpleados;
import com.adminrec.tfi.interfaces.RepositorioSolicitudes;
import com.adminrec.tfi.util.dtos.entities.SolicitudDTO;
import com.adminrec.tfi.util.enums.EstadoSolicitud;
import com.adminrec.tfi.util.mappers.SolicitudMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicioSolicitudes {
    private final RepositorioSolicitudes repositorio;
    private final RepositorioEmpleados repositorioEmpleados;

    public ServicioSolicitudes(RepositorioSolicitudes repositorio, RepositorioEmpleados repositorioEmpleados) {
        this.repositorio = repositorio;
        this.repositorioEmpleados = repositorioEmpleados;
    }

    public List<SolicitudDTO> listarTodasParaElSupervisor(Integer dni) {
        Empleado supervisor = repositorioEmpleados.findByDni(dni).get();

        return repositorio.findAllByEmpleado_Puesto_Sector_Id(supervisor.getPuesto().getSector().getId())
                .stream()
                .map(SolicitudMapper::toDTO)
                .toList();
    }

    public List<SolicitudDTO> listar(Integer dni) {
        return repositorio.findAllByEmpleado_Dni(dni)
                .stream()
                .map(SolicitudMapper::toDTO)
                .toList();
    }

    public SolicitudDTO crear(SolicitudDTO dto, Integer dni) {
        Solicitud solicitud = SolicitudMapper.fromDTO(dto);

        Empleado empleado = repositorioEmpleados.findByDni(dni).orElseThrow(
                () -> new EmpleadoInexistenteException("El empleado con el dni " + dni + " no existe")
        );

        solicitud.setEstadoSolicitud(EstadoSolicitud.PENDIENTE);
        solicitud.setEmpleado(empleado);

        repositorio.save(solicitud);

        return SolicitudMapper.toDTO(solicitud);
    }

    public SolicitudDTO cambiarEstado(Long id, String estado) {
        Solicitud solicitud = repositorio.findById(id).orElseThrow(
                () -> new SolicitudInexistenteException("La solicitud con el id " +  id + " no existe")
        );

        solicitud.setEstadoSolicitud(EstadoSolicitud.desdeString(estado));
        repositorio.save(solicitud);

        return SolicitudMapper.toDTO(solicitud);
    }
}
