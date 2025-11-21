package com.adminrec.tfi.util.enums;

import com.adminrec.tfi.exceptions.EstadoSolicitudInvalidoException;
import com.adminrec.tfi.exceptions.TipoSolicitudInvalidoException;

import java.util.Arrays;

public enum EstadoSolicitud {
    PENDIENTE,
    RECHAZADO,
    ACEPTADO;

    public boolean esValido(String estado) {
        if (estado == null) return false;
        return this.name().equalsIgnoreCase(estado);
    }

    public static EstadoSolicitud desdeString(String estado) {
        if (estado == null) throw new IllegalArgumentException("Se debe ingresar un estado de solicitud válido " + estado);
        return Arrays.stream(EstadoSolicitud.values())
                .filter(ts -> ts.esValido(estado))
                .findFirst()
                .orElseThrow(() -> new EstadoSolicitudInvalidoException("El estado de solicitud " + estado + " es inválido"));
    }
}
