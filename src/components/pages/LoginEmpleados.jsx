import { Container, Card, Button, Form, InputGroup } from "react-bootstrap";

const LoginEmpleados = () => {
  return (
    <section className="contenidoPrincipal d-flex justify-content-center align-items-center">
      <Card className="cardLogin">
        <Card.Body className="p-4">
          <div className="text-center fs-1">
            <i className="bi bi-person-circle text-primary"></i>
          </div>
          <div className="text-center">
            <h4>Sistema de Gestión de Personal</h4>
            <p>Ingrese sus credenciales para acceder al sistema</p>
          </div>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Número de legajo</Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">
                  <i className="bi bi-people"></i>
                </InputGroup.Text>
                <Form.Control placeholder="Ej: 1234" type="text" required />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">
                  <i className="bi bi-lock-fill"></i>
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  placeholder="Ingrese su contraseña"
                  required
                />
              </InputGroup>
            </Form.Group>
            <div className="d-flex justify-content-center mt-4">
              <Button variant="primary" className="w-100" type="submit">
                <i class="bi bi-arrow-bar-right"></i> Iniciar Sesión
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </section>
  );
};

export default LoginEmpleados;
