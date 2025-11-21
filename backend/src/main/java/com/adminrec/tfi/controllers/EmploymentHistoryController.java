package com.adminrec.tfi.controllers;

import com.adminrec.tfi.services.ServicioIngresoEgreso;
import com.adminrec.tfi.util.dtos.entities.IngresoEgresoDTO;
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
@RequestMapping("/api/employeehistory")
public class EmploymentHistoryController {
    private final ServicioIngresoEgreso servicio;

    public EmploymentHistoryController(ServicioIngresoEgreso servicio) {
        this.servicio = servicio;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{idEmpleado}")
    public ResponseEntity<?> listarHistorialParaElEmpleado(@PathVariable Long idEmpleado) {
        System.out.println("HOLA MUNDO " +  idEmpleado);

        Map<String, Object> response = new HashMap<>();

        try {
            List<IngresoEgresoDTO> historial = servicio.listarParaElEmpleado(idEmpleado);
            response.put("status", "success");
            response.put("historial", historial);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }
}
