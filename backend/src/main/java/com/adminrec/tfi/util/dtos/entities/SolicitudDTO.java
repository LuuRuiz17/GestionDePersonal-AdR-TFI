package com.adminrec.tfi.util.dtos.entities;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SolicitudDTO {
    private Long id;

    @NotBlank(message = "La solicitud debe tener un tipo asociado")
    private String tipoSolicitud;
    @NotBlank(message = "La solicitud debe tener una duración en días")
    @Size(max = 30, message = "La solicitud puede ser para un máximo de 30 días")
    private Integer duracionDias;
    @NotBlank(message = "La solicitud debe tener un motivo")
    private String motivo;
    @NotBlank
    private String estadoSolicitud;
    @NotNull
    private EmpleadoDTO empleado;
}
