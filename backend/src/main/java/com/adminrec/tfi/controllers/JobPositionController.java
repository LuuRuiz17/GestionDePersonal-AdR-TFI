package com.adminrec.tfi.controllers;

import com.adminrec.tfi.services.ServicioPuesto;
import com.adminrec.tfi.util.dtos.entities.PuestoDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobpositions")
public class JobPositionController {
    private final ServicioPuesto servicio;

    public JobPositionController(ServicioPuesto servicio) {
        this.servicio = servicio;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> listar() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<PuestoDTO> puestos = servicio.listar();
            response.put("status", "success");
            response.put("puestos", puestos);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> buscarUno(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<String, Object>();

        try {
            PuestoDTO puestoDTO = servicio.buscarUno(id);
            response.put("status", "success");
            response.put("empleado", puestoDTO);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("mensaje", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/")
    public ResponseEntity<Map<String, Object>> crear(@RequestBody PuestoDTO dto) {
        Map<String, Object> response = new HashMap<>();

        try {
            PuestoDTO puesto = servicio.crear(dto);
            response.put("status", "created");
            response.put("puesto", puesto);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(@PathVariable Long id, @RequestBody PuestoDTO dto) {
        Map<String, Object> response = new HashMap<>();

        try {
            PuestoDTO puesto = servicio.editar(id, dto);
            response.put("status", "success");
            response.put("puesto",  puesto);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            PuestoDTO puestoDTO = servicio.eliminar(id);
            response.put("status", "success");
            response.put("puesto",  puestoDTO);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }
}
