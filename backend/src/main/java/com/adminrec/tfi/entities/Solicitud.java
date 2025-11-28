package com.adminrec.tfi.entities;

import com.adminrec.tfi.util.enums.EstadoSolicitud;
import com.adminrec.tfi.util.enums.TipoSolicitud;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "Solicitudes")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Solicitud {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "tipo_solicitud", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoSolicitud tipoSolicitud;
    @Column(name = "duracion", nullable = false)
    private Integer duracionDias;
    @Column(name = "motivo", nullable = false)
    private String motivo;
    @Column(name = "estado_solicitud", nullable = false)
    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estadoSolicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    private Empleado empleado;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;
    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;
    @Column(name = "borrado_en")
    private LocalDateTime borradoEn;
}
