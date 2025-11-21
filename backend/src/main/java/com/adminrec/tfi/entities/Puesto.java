package com.adminrec.tfi.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Puestos")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Puesto {
    @Id
    @Column(name = "id_puesto")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "nombre", length = 30, nullable = false)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sector", nullable = false)
    private Sector sector;

    @Column(name = "valor_hora", nullable = false)
    private Double valorHora;

    @Column(name = "horas_minimas_trabajo_diario")
    private Double horasMinimasTrabajoDiario;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;
    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;
    @Column(name = "borrado_en")
    private LocalDateTime borradoEn;

    @OneToMany(mappedBy = "puesto", fetch = FetchType.LAZY)
    private List<IngresoEgreso> historicoEmpleados = new ArrayList<>();

    @OneToMany(mappedBy = "puesto", fetch = FetchType.LAZY)
    private List<Empleado> empleados = new ArrayList<>();
}
