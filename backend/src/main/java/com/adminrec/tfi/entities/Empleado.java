package com.adminrec.tfi.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Empleados")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Empleado {
    @Id
    @Column(name = "id_empleado")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "es_supervisor_de_sector", nullable = false)
    private boolean esSupervisorDeSector;
    @Column(name = "apellido", length = 50, nullable = false)
    private String apellido;
    @Column(name = "nombre", length = 50, nullable = false)
    private String nombre;
    @Column(name = "dni", nullable = false, unique = true)
    private Integer dni;
    @Column(name = "correo", nullable = false)
    private String correo;
    @Column(name = "domicilio", length = 45)
    private String domicilio;
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;
    @Column(name = "fecha_contratacion")
    private LocalDate fechaContratacion;
    @Column(name = "telefono", length = 12)
    private String telefono;
    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;
    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;
    @Column(name = "borrado_en")
    private LocalDateTime borradoEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_puesto", nullable = false)
    private Puesto puesto;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_supervisor")
    private Empleado supervisor;

    @OneToMany(mappedBy = "empleado", fetch = FetchType.LAZY)
    private List<IngresoEgreso> historicoPuestos = new ArrayList<>();
    @OneToMany(mappedBy = "empleado", fetch = FetchType.LAZY)
    private List<Asistencia> asistencias = new ArrayList<>();
    @OneToMany(mappedBy = "empleado", fetch = FetchType.LAZY)
    private List<Solicitud> solicitudes = new ArrayList<>();
}
