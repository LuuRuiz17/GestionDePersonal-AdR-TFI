import { Row, Col, Container } from "react-bootstrap";

const GestionarEmpleados = () => {
  return (
    <>
      <Container className="my-4 px-3 d-flex flex-column justify-content-center align-items-center">

        <h1 className="titulo text-md-start w-100 me-md-4">Gestionar Empleados</h1>
        <h5 className="titulo text-md-start w-100 me-md-4">Seleccione la acción que desea realizar</h5>

        <Row className="justify-content-center mt-4 gap-3 flex-md-nowrap flex-lg-nowrap w-100">
          <Col
            md={4}
            className="bg-light px-3 py-5 rounded-4 cardMenu"
          >
            <div className="my-3 text-center mb-4">
              <i
                className="bi bi-person-add fs-4 text-light py-3 px-4 rounded-4"
                style={{ backgroundColor: "#459F46" }}
              ></i>
            </div>
            <h3 className="titulo text-center">Agregar Empleado</h3>
            <p className="text-center">
              Registrar un nuevo empleado en el sistema
            </p>
          </Col>

          <Col
            md={4}
            className="bg-light px-3 py-5 rounded-4 cardMenu"
          >
            <div className="my-3 text-center mb-4">
              <i
                className="bi bi-person-gear fs-4 text-light py-3 px-4 rounded-4"
                style={{ backgroundColor: "#1D88E5" }}
              ></i>
            </div>
            <h3 className="titulo text-center">Editar Empleado</h3>
            <p className="text-center">
              Modificar información de empleados existentes
            </p>
          </Col>

          <Col
            md={4}
            className="bg-light px-3 py-5 rounded-4 cardMenu"
          >
            <div className="my-3 text-center mb-4">
              <i
                className="bi bi-person-dash fs-4 text-light py-3 px-4 rounded-4"
                style={{ backgroundColor: "#E43A33" }}
              ></i>
            </div>
            <h3 className="titulo text-center">Eliminar Empleado</h3>
            <p className="text-center">Dar de baja empleados del sistema</p>
          </Col>
        </Row>

        <Row className="mt-4 contenedor-info">
          <Col className="bg-light rounded-4 cardMenu p-4">
            <h4 className="mb-4">Información Importante</h4>

            <p>
              <b>Agregar:</b> Complete todos los datos requeridos del nuevo
              empleador
            </p>

            <p>
              <b>Editar:</b> Busque el empleado por legajo o nombre para
              modificar sus datos
            </p>

            <p>
              <b>Eliminar:</b> La eliminación es permanente. Asegúrese de
              confirmar la acción
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default GestionarEmpleados;
