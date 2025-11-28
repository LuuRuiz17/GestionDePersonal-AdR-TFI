package com.adminrec.tfi.controllers;

import com.adminrec.tfi.services.ServicioSector;
import com.adminrec.tfi.util.dtos.entities.DetalleSectorDTO;
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
@RequestMapping("/api/sectors")
public class SectorController {
    private final ServicioSector servicio;

    public SectorController(ServicioSector servicio) {
        this.servicio = servicio;
    }

    @PreAuthorize("hasRole('SUPERVISOR') or hasRole('EMPLOYEE')")
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

    @PreAuthorize("hasRole('SUPERVISOR') or hasRole('EMPLOYEE')")
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarUno(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            DetalleSectorDTO sector = servicio.buscarUno(id);
            response.put("status", "success");
            response.put("sector", sector);

            return ResponseEntity.ok(response);
        }   catch (Exception e){
            response.put("status", "error");
            response.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }
}
