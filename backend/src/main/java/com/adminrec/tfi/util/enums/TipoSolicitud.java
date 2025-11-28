package com.adminrec.tfi.util.enums;

import com.adminrec.tfi.exceptions.TipoSolicitudInvalidoException;

import java.util.Arrays;

public enum TipoSolicitud {
    VACACIONES,
    PERMISO,
    LICENCIA;

    public boolean esValido(String tipoSolicitud) {
        if (tipoSolicitud == null) return false;
        return this.name().equalsIgnoreCase(tipoSolicitud);
    }

    public static TipoSolicitud desdeString(String tipoSolicitud) {
        if (tipoSolicitud == null) throw new IllegalArgumentException("Se debe ingresar un tipo de solicitud válido " + tipoSolicitud);
        return Arrays.stream(TipoSolicitud.values())
                .filter(ts -> ts.esValido(tipoSolicitud))
                .findFirst()
                .orElseThrow(() -> new TipoSolicitudInvalidoException("El tipo de solicitud " + tipoSolicitud + " es inválido"));
    }
}
