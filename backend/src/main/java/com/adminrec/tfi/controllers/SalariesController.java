package com.adminrec.tfi.controllers;

import com.adminrec.tfi.services.ServicioEmpleado;
import com.adminrec.tfi.util.dtos.entities.AsistenciaDTO;
import com.adminrec.tfi.util.dtos.entities.EmpleadoDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salaries")
public class SalariesController {
    private final ServicioEmpleado servicio;

    public SalariesController(ServicioEmpleado servicio) {
        this.servicio = servicio;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR')")
    @GetMapping("/")
    public ResponseEntity<?> listarEmpleados() {
        Map<String, Object> response = new HashMap<>();

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

    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERVISOR')")
    @GetMapping("/{idEmpleado}")
    public ResponseEntity<?> obtenerAsistenciasEmpleado(@PathVariable Long idEmpleado) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<AsistenciaDTO> asistencias = servicio.obtenerAsistencias(idEmpleado);
            response.put("status", "success");
            response.put("asistencias", asistencias);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/report")
    public ResponseEntity<?> obtenerInformacionParaReporte() {
        Map<String, Object> response = new HashMap<>();

        try {
            response.put("status", "success");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }
}
