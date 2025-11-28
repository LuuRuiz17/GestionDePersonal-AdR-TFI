package com.adminrec.tfi.util.dtos.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IngresoEgresoDTO {
    private Long id;
    private String nombreCompleto;
    private Integer dni;
    private String nombrePuesto;
    private String nombreSector;
    private LocalDate fechaIngreso;
    private LocalDate fechaSalida;
}
