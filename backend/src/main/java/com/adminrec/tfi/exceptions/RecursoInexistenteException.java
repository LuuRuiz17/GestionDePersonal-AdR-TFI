package com.adminrec.tfi.exceptions;

public abstract class RecursoInexistenteException extends RuntimeException {
    public RecursoInexistenteException(String message) {
        super(message);
    }
}
