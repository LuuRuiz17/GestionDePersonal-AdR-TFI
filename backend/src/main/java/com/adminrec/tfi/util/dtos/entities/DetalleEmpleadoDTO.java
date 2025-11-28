package com.adminrec.tfi.util.dtos.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DetalleEmpleadoDTO {
    private Long id;
    private String apellido;
    private String nombre;
    private Integer dni;
    private String correo;
    private String domicilio;
    private LocalDate fechaNacimiento;
    private LocalDate fechaContratacion;
    private String telefono;
    private boolean esSupervisorDeSector;
    private DetalleEmpleadoDTO supervisor;
}
