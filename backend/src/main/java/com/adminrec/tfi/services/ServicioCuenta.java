package com.adminrec.tfi.services;

import com.adminrec.tfi.entities.Cuenta;
import com.adminrec.tfi.entities.Empleado;
import com.adminrec.tfi.exceptions.CredencialesInvalidasException;
import com.adminrec.tfi.exceptions.EmpleadoInexistenteException;
import com.adminrec.tfi.interfaces.RepositorioCuentas;
import com.adminrec.tfi.interfaces.RepositorioEmpleados;
import com.adminrec.tfi.util.enums.Rol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ServicioCuenta {
    private final PasswordEncoder passwordEncoder;
    private final RepositorioEmpleados repositorioEmpleados;
    private final RepositorioCuentas repositorioCuentas;

    public ServicioCuenta(PasswordEncoder passwordEncoder, RepositorioEmpleados repositorioEmpleados, RepositorioCuentas repositorioCuentas) {
        this.passwordEncoder = passwordEncoder;
        this.repositorioEmpleados = repositorioEmpleados;
        this.repositorioCuentas = repositorioCuentas;
    }

    // No expuesto a API, para uso interno en CuentaDataLoader
    public Cuenta crearCuenta(Empleado empleado, String contrasenaPlano, Rol rol) {
        if (repositorioCuentas.existsByEmpleado_Dni(empleado.getDni())) {
            return repositorioCuentas.findByEmpleado_Dni(empleado.getDni());
        }

        Cuenta cuenta = new Cuenta();
        cuenta.setEmpleado(empleado);
        cuenta.setContrasena(passwordEncoder.encode(contrasenaPlano));
        cuenta.setRol(rol);

        return repositorioCuentas.save(cuenta);
    }

    public Cuenta iniciarSesion(Integer dniEmpleado, String contrasena) {
        Cuenta cuenta = repositorioCuentas.findByEmpleado_Dni(dniEmpleado);

        if (
                cuenta == null || !passwordEncoder.matches(contrasena, cuenta.getContrasena())
        ) throw new CredencialesInvalidasException("Usuario o contraseña inválidos");

        return cuenta;
    }

    public Empleado obtenerEmpleadoAsociado(Integer dni) {
        return repositorioEmpleados.findByDni(dni)
                .orElseThrow(() -> new EmpleadoInexistenteException("No se encontró ningún empleado con el dni " + dni));
    }
}
