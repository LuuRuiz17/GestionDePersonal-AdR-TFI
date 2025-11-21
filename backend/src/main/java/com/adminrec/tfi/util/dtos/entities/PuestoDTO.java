package com.adminrec.tfi.util.dtos.entities;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PuestoDTO {
    private Long id;

    @NotBlank(message = "El nombre del puesto es obligatorio")
    @Size(max = 30, message = "El nombre del puesto no puede superar 30 caracteres")
    private String nombre;

    @NotNull(message = "El sector es obligatorio")
    private SectorDTO sector;

    @NotNull(message = "El valor hora es obligatorio")
    @Positive(message = "El valor hora debe ser mayor a 0")
    private Double valorHora;

    @NotNull(message = "El puesto debe tener un mínimo de horas laborales diarias")
    @Size(min = 2, max = 8, message = "El mínimo de horas laborales diarias debe estar entre 2 y 8 horas")
    private Double horasMinimasTrabajoDiario;
}
