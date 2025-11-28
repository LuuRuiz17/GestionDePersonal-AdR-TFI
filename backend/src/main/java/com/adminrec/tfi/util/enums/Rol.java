package com.adminrec.tfi.util.enums;

import com.adminrec.tfi.exceptions.RolInvalidoException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;

public enum Rol {
    ADMIN(EnumSet.of(
            Permiso.ADREC01_MANAGE_EMPLOYEE,
            Permiso.ADREC02_MANAGE_JOB,
            Permiso.ADREC04_ASSIGN_SUPERVISOR,
            Permiso.ADREC09_GENERATE_REPORT
    )),
    EMPLOYEE(EnumSet.of(
            Permiso.ADREC03_CONSULT_SECTOR,
            Permiso.ADREC05_REGISTER_ATTENDANCE,
            Permiso.ADREC06_CREATE_REQUEST
    )),
    SUPERVISOR(EnumSet.of(
            Permiso.ADREC03_CONSULT_SECTOR,
            Permiso.ADREC05_REGISTER_ATTENDANCE,
            Permiso.ADREC07_MANAGE_REQUEST,
            Permiso.ADREC08_CALCULATE_SALARIES
    ));

    private final EnumSet<Permiso> permisos;

    Rol(EnumSet<Permiso> permisos) {
        this.permisos = permisos;
    }

    public EnumSet<Permiso> getPermisos() {
        return permisos;
    }

    public List<SimpleGrantedAuthority> getGrantedAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        for (Permiso p : permisos) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + p));
        }

        return authorities;
    }

    public boolean esValido(String rol) {
        if (rol == null) return false;
        return rol.equalsIgnoreCase(this.name());
    }

    public static Rol desdeString(String rol) {
        if (rol == null) throw new IllegalArgumentException("Se debe ingresar un rol válido " + rol);

        return Arrays.stream(Rol.values())
                .filter(r -> r.esValido(rol))
                .findFirst()
                .orElseThrow(() -> new RolInvalidoException("El rol " + rol + " no existe"));
    }
}
