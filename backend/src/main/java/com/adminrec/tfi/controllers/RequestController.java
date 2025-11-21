package com.adminrec.tfi.controllers;

import com.adminrec.tfi.services.ServicioSolicitudes;
import com.adminrec.tfi.util.dtos.entities.SolicitudDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class RequestController {
    private final ServicioSolicitudes servicio;

    public RequestController(ServicioSolicitudes servicio) {
        this.servicio = servicio;
    }

    public record EstadoPayload(String estado) {}

    // Lista todas las solicitudes que realizo un empleado
    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/")
    public ResponseEntity<?> listarParaUnEmpleado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer dni = Integer.valueOf(auth.getName());

        Map<String, Object> response = new HashMap<>();
        System.out.println(dni);
        System.out.println("Authorities = " + auth.getAuthorities());
        try {
            List<SolicitudDTO> solicitudes = servicio.listar(dni);
            response.put("status", "success");
            response.put("solicitudes", solicitudes);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('EMPLOYEE')")
    @PostMapping("/")
    public ResponseEntity<?> crear(@RequestBody SolicitudDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer dni = Integer.valueOf(auth.getName());

        Map<String, Object> response = new HashMap<>();

        try {
            SolicitudDTO solicitud = servicio.crear(dto, dni);
            response.put("status", "success");
            response.put("solicitud", solicitud);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    // Lista todas las solicitudes del sector al que pertenece el supervisor
    @PreAuthorize("hasRole('SUPERVISOR')")
    @GetMapping("/all")
    public ResponseEntity<?> listarTodas() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer dni = Integer.valueOf(auth.getName());

        Map<String, Object> response = new HashMap<>();

        try {
            List<SolicitudDTO> solicitudes = servicio.listarTodasParaElSupervisor(dni);
            response.put("status", "success");
            response.put("solicitudes", solicitudes);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('SUPERVISOR')")
    @PutMapping("/{id}")
    public ResponseEntity<?> cambiarEstadoSolicitud(@RequestBody EstadoPayload estado, @PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            SolicitudDTO solicitud = servicio.cambiarEstado(id, estado.estado());
            response.put("status", "success");
            response.put("solicitud", solicitud);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }
}
