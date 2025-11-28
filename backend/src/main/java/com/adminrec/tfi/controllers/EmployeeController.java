package com.adminrec.tfi.controllers;

import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.services.ServicioEmpleado;
import com.adminrec.tfi.util.dtos.entities.EmpleadoDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final ServicioEmpleado servicio;

    public EmployeeController(ServicioEmpleado servicio)
    {
        this.servicio=servicio;
    }

    public record RegistroEmpleadoDTO(
            @Valid EmpleadoDTO empleado,
            @NotBlank(message = "La contraseña es obligatoria")
            String contrasena
    ) {}

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/")
    public ResponseEntity<?> listar() {
        Map<String, Object> response = new HashMap<String, Object>();

        try {
            List<EmpleadoDTO> empleados = servicio.listar();
            response.put("status", "success");
            response.put("empleados", empleados);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarUno(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<String, Object>();

        try {
            EmpleadoDTO empleadoDTO = servicio.buscarUno(id);
            response.put("status", "success");
            response.put("empleado", empleadoDTO);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/")
    public ResponseEntity<?> crear(@Valid @RequestBody RegistroEmpleadoDTO dto) {
        Map<String, Object> response = new HashMap<>();

        try {
            EmpleadoDTO empleado = servicio.crear(dto.empleado(), dto.contrasena());
            System.out.println(dto.empleado().getPuesto().getId());
            System.out.println(dto.empleado().toString());
            response.put("status", "success");
            response.put("empleado", empleado);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody @Valid EmpleadoDTO dto) {
        Map<String, Object> response = new HashMap<String, Object>();

        try {
            EmpleadoDTO empleado = servicio.editar(id, dto);
            response.put("status", "success");
            response.put("empleado", empleado);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<String, Object>();

        try {
            EmpleadoDTO empleado = servicio.eliminar(id);
            response.put("status", "success");
            response.put("empleado", empleado);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }
}
