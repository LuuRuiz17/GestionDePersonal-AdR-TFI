package com.adminrec.tfi.controllers;

import com.adminrec.tfi.services.ServicioSector;
import com.adminrec.tfi.util.dtos.entities.DetalleSectorDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/supervisors")
public class SupervisorController {
    private final ServicioSector servicio;

    public SupervisorController(ServicioSector servicio) {
        this.servicio = servicio;
    }

    public record SupervisoresPayload(List<Long> idsSupervisores) {}

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/")
    public ResponseEntity<?> listar() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<DetalleSectorDTO> sectores = servicio.listar();
            response.put("status", "success");
            response.put("sectores", sectores);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarUno(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            DetalleSectorDTO sectores = servicio.buscarUno(id);
            response.put("status", "success");
            response.put("sectores", sectores);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{idSector}")
    public ResponseEntity<?> asignarSupervisores(
            @PathVariable Long idSector,
            @RequestBody SupervisoresPayload idsSupervisores
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            DetalleSectorDTO sector = servicio.actualizarSupervisores(idSector, idsSupervisores.idsSupervisores());
            response.put("status", "success");
            response.put("sector", sector);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }

    }
}
