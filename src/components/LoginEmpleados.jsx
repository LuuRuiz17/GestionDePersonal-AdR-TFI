import { Container, Card, Button } from "react-bootstrap";

const LoginEmpleados = () => {
  return (
    <section className="contenidoPrincipal">
      <Container>
        <Card style={{ width: "18rem" }}>
          <Card.Body>
            <div className="text-center">
              <Card.Title>Sistema de Gestión de Personal</Card.Title>
              <p className="text-muted">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>
            <Card.Text>
              Some quick example text to build on the card title and make up the
              bulk of the card's content.
            </Card.Text>
            <Button variant="primary">Go somewhere</Button>
          </Card.Body>
        </Card>
      </Container>
    </section>
  );
};

export default LoginEmpleados;
