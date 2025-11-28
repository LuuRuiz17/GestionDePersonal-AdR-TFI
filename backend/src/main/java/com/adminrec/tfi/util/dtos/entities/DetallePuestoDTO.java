package com.adminrec.tfi.util.dtos.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DetallePuestoDTO {
    private Long id;
    private String nombre;
    private List<DetalleEmpleadoDTO> empleados;
}
