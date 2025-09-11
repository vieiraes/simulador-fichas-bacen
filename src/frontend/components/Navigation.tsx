import React from 'react'
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { Link } from 'react-router-dom'

const Navigation = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Simulador Bacen</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Dashboard</Nav.Link>
            </LinkContainer>
            <NavDropdown title="PIX" id="pix-dropdown">
              <LinkContainer to="/pix/sucesso">
                <NavDropdown.Item as={Link} to="/pix/sucesso">Transação Sucesso</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/pix/falha">
                <NavDropdown.Item as={Link} to="/pix/falha">Transação Falha</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
            <NavDropdown title="Chaves" id="chave-dropdown">
              <LinkContainer to="/chave/sucesso">
                <NavDropdown.Item as={Link} to="/chave/sucesso">Consulta Sucesso</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/chave/falha">
                <NavDropdown.Item as={Link} to="/chave/falha">Consulta Falha</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation