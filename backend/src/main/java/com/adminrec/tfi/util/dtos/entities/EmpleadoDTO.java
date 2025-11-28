package com.adminrec.tfi.util.dtos.entities;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmpleadoDTO {
    private Long id;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max=50, message = "El apellido no puede superar los 50 caracteres")
    private String apellido;
    @NotBlank(message = "El nombre es obligatorio")
    @Length(max=50, message = "El nombre no puede superar los 50 caracteres")
    private String nombre;
    @NotNull(message = "El DNI es obligatorio")
    @Min(value = 9999999, message = "El DNI debe ser un número válido")
    @Max(value = 99999999, message = "El DNI no puede tener más de 8 dígitos")
    private Integer dni;
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    private String correo;
    @NotBlank(message = "El domicilio es obligatorio")
    @Size(max=45, message = "El domicilio no puede superar los 45 caracteres")
    private String domicilio;
    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha de nacimiento debe ser una fecha en el pasado")
    private LocalDate fechaNacimiento;

    @AssertTrue(message = "El empleado debe tener al menos 18 años")
    public boolean esMayorDeEdad() {
        return fechaNacimiento != null &&
                !fechaNacimiento.isAfter(LocalDate.now().minusYears(18));
    }

    @NotNull(message = "La fecha de contratación es obligatoria")
    @PastOrPresent(message = "La fecha de contratación no puede ser una fecha futura")
    private LocalDate fechaContratacion;
    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(
            regexp = "^[0-9\\-+() ]{6,15}$",
            message = "El teléfono tiene un formato inválido"
    )
    private String telefono;

    @NotNull
    private PuestoDTO puesto;
    //private EmpleadoDTO supervisor;
}
