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
public class CuentaDTO {
    private Long id;
    @NotNull
    private EmpleadoDTO empleado;
    @NotBlank(message = "El nombre del puesto es obligatorio")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String contrasena;
    @NotBlank(message = "La cuenta debe tener un rol asociado")
    private String rol;
}
