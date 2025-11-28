# Credenciales de Prueba

## Sistema de Autenticación

El sistema ahora cuenta con un formulario de inicio de sesión que requiere **DNI** y **contraseña** para acceder.

### Credenciales de Ejemplo

Las siguientes credenciales están preconfiguradas para realizar pruebas:

| DNI | Contraseña | Empleado |
|-----|------------|----------|
| 12345678 | Admin123 | Juan Pérez |
| 23456789 | Maria123 | María González |
| 45678901 | Ana12345 | Ana Martínez |

### Registro de Nuevos Empleados

Cuando se registra un nuevo empleado a través del módulo "Gestionar Empleados":

1. Se completa el formulario de datos del empleado
2. Al guardar, el sistema automáticamente redirige a una pantalla de registro de contraseña
3. Se debe ingresar una contraseña dos veces para confirmar
4. La contraseña debe cumplir con los siguientes requisitos:
   - Mínimo 8 caracteres
   - Al menos una letra mayúscula
   - Al menos una letra minúscula
   - Al menos un número

5. Los campos de contraseña tienen un botón con ícono de ojo para mostrar/ocultar el texto
6. Una vez registrada la contraseña, el empleado podrá iniciar sesión en el sistema

### Características del Login

- **Validación de DNI**: Debe tener 7 u 8 dígitos
- **Inputs tipo password**: Las contraseñas están ocultas por defecto
- **Toggle de visibilidad**: Botón con ícono de ojo para ver/ocultar contraseña
- **Feedback visual**: Mensajes de error claros y específicos
- **Animación de carga**: Indicador visual mientras se procesa el login
- **Sesión persistente**: Una vez logueado, se mantiene la sesión hasta cerrar manualmente

### Cerrar Sesión

El botón "Cerrar Sesión" está ubicado en la esquina superior derecha del header y permite salir del sistema en cualquier momento.
