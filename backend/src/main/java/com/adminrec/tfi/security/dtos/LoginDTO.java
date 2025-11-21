package com.adminrec.tfi.security.dtos;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginDTO {
    private Integer dniEmpleado;
    private String contrasena;
}
