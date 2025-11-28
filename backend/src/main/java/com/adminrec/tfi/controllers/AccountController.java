package com.adminrec.tfi.controllers;

import com.adminrec.tfi.entities.Cuenta;
import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.services.ServicioCuenta;
import com.adminrec.tfi.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AccountController {
    private final ServicioCuenta servicio;
    private final JwtUtil jwtUtil;

    public AccountController(ServicioCuenta servicio, JwtUtil jwtUtil) {
        this.servicio = servicio;
        this.jwtUtil = jwtUtil;
    }

    public record AccountRequest(Integer dni, String contrasena) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AccountRequest credentials) {
        Map<String, Object> response = new HashMap<>();

        try {
            Cuenta cuenta = servicio.iniciarSesion(credentials.dni(), credentials.contrasena());

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", cuenta.getRol());

            Empleado empleado = servicio.obtenerEmpleadoAsociado(credentials.dni());
            claims.put("employee_complete_name", empleado.getApellido() + ", " + empleado.getNombre());
            claims.put("employee_dni", empleado.getDni());

            String tk = jwtUtil.generateToken(String.valueOf(cuenta.getEmpleado().getDni()), claims);
            response.put("status", "success");
            response.put("mensaje", "Inicio de sesión exitoso");
            response.put("token", tk);
            response.put("role", cuenta.getRol());
            response.put("employee_complete_name", empleado.getNombre() + " " +  empleado.getApellido());

            return ResponseEntity.ok(response);
        } catch(Exception e) {
            response.put("status", "error");
            response.put("mensaje", "Error al iniciar Sesion");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

