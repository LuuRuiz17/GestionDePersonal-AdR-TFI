package com.adminrec.tfi.controllers;

import com.adminrec.tfi.services.ServicioAsistencia;
import com.adminrec.tfi.util.dtos.entities.AsistenciaDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    private final ServicioAsistencia servicio;

    public AttendanceController(ServicioAsistencia servicio) {
        this.servicio = servicio;
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('SUPERVISOR')")
    @PostMapping("/")
    public ResponseEntity<?> registrarAsistencia() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Integer dni = Integer.valueOf(authentication.getName());

        Map<String, Object> response = new HashMap<>();

        try {
            AsistenciaDTO asistencia = servicio.registrar(dni);
            response.put("status", "success");
            response.put("asistencia", asistencia);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('SUPERVISOR')")
    @GetMapping("/all")
    public ResponseEntity<?> listarTodasParaElEmpleado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Integer dni = Integer.valueOf(authentication.getName());

        Map<String, Object> response = new HashMap<>();

        try {
            List<AsistenciaDTO> asistencias = servicio.listarTodasPara(dni);
            response.put("status", "success");
            response.put("asistencias", asistencias);

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }


    }
}
