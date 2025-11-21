package com.adminrec.tfi.util.dtos.entities;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IngresoEgresoDTO {
    private Long id;
    @NotNull
    private EmpleadoDTO empleado;
    @NotNull
    private PuestoDTO puesto;
}
