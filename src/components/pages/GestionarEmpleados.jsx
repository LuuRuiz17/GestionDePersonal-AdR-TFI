import { Card, Row, Col, Container } from "react-bootstrap";

const GestionarEmpleados = () => {
  return (
    <>
      <Container className="my-auto">
        <h1 className="titulo">Gestionar Empleados</h1>
        <h5 className="titulo">Seleccione la acción que desea realizar</h5>
        <Row className="d-flex justify-content-center flex-nowrap mt-4">
          <Col className="bg-dark me-2 rounded-3">
            <h3 className="text-info">Agregar Empleado</h3>
            <p>Registrar un nuevo empleado en el sistema</p>
          </Col>
          <Col className="bg-dark me-2 rounded-3">
            <h3 className="text-info titulo">Editar Empleado</h3>
            <p>Modificar información de empleados existentes</p>
          </Col>
          <Col className="bg-dark rounded-3">
            <h3 className="text-info">Eliminar Empleado</h3>
            <p>Dar de baja empleados del sistema</p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default GestionarEmpleados;
