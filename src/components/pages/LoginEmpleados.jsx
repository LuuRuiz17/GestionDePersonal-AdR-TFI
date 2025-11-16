import { Container, Card, Button, Form, InputGroup  } from "react-bootstrap";

const LoginEmpleados = () => {
  return (
    <section className="contenidoPrincipal d-flex justify-content-center align-items-center">
      <Container>
        <Card style={{ width: "18rem" }}>
          <Card.Body>
            <div className="text-center">
              <Card.Title>Sistema de Gestión de Personal</Card.Title>
              <p className="text-muted">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Número de legajo</Form.Label>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1"><i class="bi bi-people"></i></InputGroup.Text>
                  <Form.Control
                    placeholder="Ej: 1234"
                    type="text"
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Contraseña</Form.Label>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1"><i class="bi bi-lock-fill"></i></InputGroup.Text>
                  <Form.Control
                  type="password"
                    placeholder="Ingrese su contraseña"
                    required
                  />
                </InputGroup>
              </Form.Group>
              
              <Button variant="primary" type="submit">
                Iniciar Sesión
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </section>
  );
};

export default LoginEmpleados;
