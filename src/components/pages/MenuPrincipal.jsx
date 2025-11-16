import { Row, Container, Col } from "react-bootstrap";

const MenuPrincipal = () => {
  return (
    <Container className="my-3 p-4 my-auto">
      <div className="mx-auto text-center">
        <h1 className="titulo">Menú Principal</h1>
        <h4 className="titulo">Seleccione una opción para comenzar</h4>
      </div>
      <Row className="d-flex justify-content-center mt-4 gap-3">
        <Col md={3} className="cardMenu p-3 m-1 rounded-4 text-center">
          <div className="my-3">
            <i
              class="bi bi-people fs-4 text-light py-3 px-4 rounded-4"
              style={{ backgroundColor: "#4051B7" }}
            ></i>
          </div>
          <h5 className="mt-4">Gestionar Empleados</h5>
          <p>Agregar, editar y eliminar empleados</p>
        </Col>
        <Col md={3} className="cardMenu p-3 m-1 rounded-4 text-center">
          <div className="my-3">
            <i
              class="bi bi-suitcase-lg fs-4 text-light py-3 px-4 rounded-4"
              style={{ backgroundColor: "#03877B" }}
            ></i>
          </div>
          <h5 className="mt-4">Gestionar Puestos</h5>
          <p>Administrar puestos de trabajo</p>
        </Col>
        <Col md={3} className="cardMenu p-3 m-1 rounded-4 text-center">
          <div className="my-3">
            <i
              class="bi bi-grid fs-4 text-light py-3 px-4 rounded-4"
              style={{ backgroundColor: "#5D35B0" }}
            ></i>
          </div>
          <h5 className="mt-4">Consultar Sector</h5>
          <p>Ver información de sectores</p>
        </Col>

        <Col md={3} className="cardMenu p-3 m-1 rounded-4 text-center">
          <div className="my-3">
            <i
              class="bi bi-person-check fs-4 text-light py-3 px-4 rounded-4"
              style={{ backgroundColor: "#1D88E5" }}
            ></i>
          </div>
          <h5 className="mt-4">Asignar Supervisor</h5>
          <p>Asignar supervisores a empleados</p>
        </Col>
        <Col md={3} className="cardMenu p-3 m-1 rounded-4 text-center">
          <div className="my-3">
            <i
              class="bi bi-calendar-check fs-4 text-light py-3 px-4 rounded-4"
              style={{ backgroundColor: "#459F46" }}
            ></i>
          </div>
          <h5 className="mt-4">Registrar Asistencia</h5>
          <p>Registrar entrada y salida</p>
        </Col>
        <Col md={3} className="cardMenu p-3 m-1 rounded-4 text-center">
          <div className="my-3">
            <i
              class="bi bi-file-earmark-text fs-4 text-light py-3 px-4 rounded-4"
              style={{ backgroundColor: "#FD8B00" }}
            ></i>
          </div>
          <h5 className="mt-4">Generar Solicitud</h5>
          <p>Crear nuevas solicitudes</p>
        </Col>

        <Col md={3} className="cardMenu p-3 m-1 rounded-4 text-center">
          <div className="my-3">
            <i
              class="bi bi-clipboard2 fs-4 text-light py-3 px-4 rounded-4"
              style={{ backgroundColor: "#E43A33" }}
            ></i>
          </div>
          <h5 className="mt-4">Gestionar Solicitud</h5>
          <p>Aprobar o rechazar solicitudes</p>
        </Col>
        <Col md={3} className="cardMenu p-3 m-1 rounded-4 text-center">
          <div className="my-3">
            <i
              class="bi bi-currency-dollar fs-4 text-light py-3 px-4 rounded-4"
              style={{ backgroundColor: "#6D4D40" }}
            ></i>
          </div>
          <h5 className="mt-4">Calcular Sueldos</h5>
          <p>Procesar nómina y salarios</p>
        </Col>
        <Col md={3} className="cardMenu p-3 m-1 rounded-4 text-center">
          <div className="my-3">
            <i
              class="bi bi-bar-chart fs-4 text-light py-3 px-4 rounded-4"
              style={{ backgroundColor: "#546F7A" }}
            ></i>
          </div>
          <h5 className="mt-4">Generar Reporte</h5>
          <p>Crear reportes y estadísticas</p>
        </Col>
      </Row>
    </Container>
  );
};

export default MenuPrincipal;
