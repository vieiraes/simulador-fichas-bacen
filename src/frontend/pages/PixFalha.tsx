import React, { useState } from 'react'
import { Card, Form, Button, Alert, Spinner, Container, Row, Col } from 'react-bootstrap'
import apiService from '../services/api'

const wallets = [
  { id: '469834d9-61b0-4893-81c1-94418f300e0a', name: 'Cliente 1' },
  { id: 'd2dde215-98d8-43be-954f-384ed8c3de4c', name: 'Cliente 2' },
  { id: 'cf82633d-71f9-4ff0-ab3e-7a8163d3fc06', name: 'Cliente 3' }
]

const PixFalha = () => {
  const [selectedWallet, setSelectedWallet] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWallet) {
      setError('Por favor, selecione uma wallet')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await apiService.pixFalha(selectedWallet)
      setResult(response)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar transação PIX')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <h1 className="mb-4">Transação PIX - Falha</h1>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Selecione a Wallet</Form.Label>
                  <Form.Select 
                    value={selectedWallet} 
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Escolha uma wallet</option>
                    {wallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} - {wallet.id.substring(0, 8)}...
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Button 
                  variant="danger" 
                  type="submit" 
                  disabled={loading || !selectedWallet}
                  className="w-100"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{' '}
                      Processando...
                    </>
                  ) : (
                    'Executar Transação PIX (Falha)'
                  )}
                </Button>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}

              {result && (
                <Alert 
                  variant={result.message.includes('não efeutado') ? 'danger' : 'success'} 
                  className="mt-3"
                >
                  <h5>Resultado:</h5>
                  <p><strong>Mensagem:</strong> {result.message}</p>
                  {result.wallets && (
                    <p><strong>Bucket Cliente:</strong> {result.wallets.balde} fichas</p>
                  )}
                  {result.ispb !== undefined && (
                    <p><strong>Bucket ISPB:</strong> {result.ispb} fichas</p>
                  )}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default PixFalha