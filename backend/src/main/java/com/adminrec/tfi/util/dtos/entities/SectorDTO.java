package com.adminrec.tfi.util.dtos.entities;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SectorDTO {
    private Long id;

    @NotBlank(message = "El nombre del sector es obligatorio")
    @Size(max = 30, message = "El nombre del sector no puede superar 30 caracteres")
    private String nombre;
}
