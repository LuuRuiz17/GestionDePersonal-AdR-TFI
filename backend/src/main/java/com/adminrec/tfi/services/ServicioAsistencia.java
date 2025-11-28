package com.adminrec.tfi.services;

import com.adminrec.tfi.entities.Asistencia;
import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.exceptions.AsistenciaYaRegistradaException;
import com.adminrec.tfi.exceptions.EmpleadoInexistenteException;
import com.adminrec.tfi.interfaces.RepositorioAsistencia;
import com.adminrec.tfi.interfaces.RepositorioEmpleados;
import com.adminrec.tfi.util.dtos.entities.AsistenciaDTO;
import com.adminrec.tfi.util.mappers.AsistenciaMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ServicioAsistencia {
    private final RepositorioAsistencia repositorio;
    private final RepositorioEmpleados repositorioEmpleados;

    public ServicioAsistencia(RepositorioAsistencia repositorio, RepositorioEmpleados repositorioEmpleados) {
        this.repositorio = repositorio;
        this.repositorioEmpleados = repositorioEmpleados;
    }

    public AsistenciaDTO registrar(Integer dni) {
        Empleado empleado = repositorioEmpleados.findByDni(dni).orElseThrow(
                () -> new EmpleadoInexistenteException("El empleado con el dni " + dni + " no existe")
        );

        List<Asistencia> asistenciasHoy =
                repositorio.findAllByEmpleado_DniAndCreadoEnBetween(
                        dni,
                        LocalDateTime.now().toLocalDate().atStartOfDay(),
                        LocalDateTime.now().toLocalDate().atStartOfDay().plusDays(1).minusSeconds(1)
                );

        if (asistenciasHoy.isEmpty()) {
            Asistencia asistencia = new Asistencia();
            asistencia.setEmpleado(empleado);
            asistencia.setCreadoEn(LocalDateTime.now());
            repositorio.save(asistencia);

            return AsistenciaMapper.toDTO(asistencia);
        } else {
            throw new AsistenciaYaRegistradaException("Ya registraste tu asistencia hoy!");
        }
    }

    public List<AsistenciaDTO> listarTodasPara(Integer dni) {
        return repositorio.findAllByEmpleado_Dni(dni)
                .stream()
                .map(AsistenciaMapper::toDTO)
                .toList();
    }
}
