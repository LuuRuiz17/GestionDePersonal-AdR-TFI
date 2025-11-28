package com.adminrec.tfi.services;

import com.adminrec.tfi.entities.Cuenta;
import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.entities.Puesto;
import com.adminrec.tfi.entities.Sector;
import com.adminrec.tfi.exceptions.SectorInexistenteException;
import com.adminrec.tfi.interfaces.RepositorioCuentas;
import com.adminrec.tfi.interfaces.RepositorioEmpleados;
import com.adminrec.tfi.interfaces.RepositorioSectores;
import com.adminrec.tfi.util.dtos.entities.DetalleSectorDTO;
import com.adminrec.tfi.util.enums.Rol;
import com.adminrec.tfi.util.mappers.PuestoMapper;
import com.adminrec.tfi.util.mappers.SectorMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ServicioSector {
    private final RepositorioSectores repositorioSectores;
    private final RepositorioEmpleados repositorioEmpleados;
    private final RepositorioCuentas repositorioCuentas;

    public ServicioSector(RepositorioSectores repositorioSectores, RepositorioEmpleados repositorioEmpleados, RepositorioCuentas repositorioCuentas) {
        this.repositorioSectores = repositorioSectores;
        this.repositorioEmpleados = repositorioEmpleados;
        this.repositorioCuentas = repositorioCuentas;
    }

    public List<DetalleSectorDTO> listar() {
        return repositorioSectores.findAll().stream()
                .map(SectorMapper::toDetalleDTO)
                .toList();
    }

    public DetalleSectorDTO buscarUno(Long id) {
        Sector sector = repositorioSectores.findById(id).orElseThrow(
                () -> new SectorInexistenteException("El sector con el id " + id + " no existe")
        );

        return SectorMapper.toDetalleDTO(sector);
    }

    public void eliminarSector(Long id) {
        Sector sector = repositorioSectores.findById(id).orElseThrow(
                () -> new SectorInexistenteException("El sector con el id " + id + " no existe")
        );

        sector.setBorradoEn(LocalDateTime.now());
        repositorioSectores.delete(sector);
    }

    public DetalleSectorDTO actualizarSupervisores(Long id, List<Long> idsSupervisores) {
        Sector sector = repositorioSectores.findById(id).orElseThrow(
                () -> new SectorInexistenteException("El sector con el id " + id + " no existe")
        );

        List<Empleado> empleados = sector.getPuestos()
                .stream()
                .flatMap(p -> p.getEmpleados().stream())
                .toList();

        for (Empleado empleado : empleados) {
            boolean debeSerSupervisor = idsSupervisores.contains(empleado.getId());

            if (empleado.isEsSupervisorDeSector() != debeSerSupervisor) {
                empleado.setEsSupervisorDeSector(debeSerSupervisor);
                repositorioEmpleados.save(empleado);

                Cuenta cuentaAsociada = repositorioCuentas.findByEmpleado_Dni(empleado.getDni());

                if (cuentaAsociada != null) {
                    cuentaAsociada.setRol(debeSerSupervisor? Rol.SUPERVISOR : Rol.EMPLOYEE);
                    repositorioCuentas.save(cuentaAsociada);
                }
            }
        }

        Sector sectorActualizado = repositorioSectores.findById(sector.getId()).get();

        return SectorMapper.toDetalleDTO(sectorActualizado);
    }
}
