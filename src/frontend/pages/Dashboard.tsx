import React, { useState } from 'react'
import { Card, Row, Col, Button, Alert, Accordion, Form } from 'react-bootstrap'
import { useSimulation } from '../context/SimulationContext'

const Dashboard = () => {
  const { data: dashboardData, recargaBuckets, pixSucesso, pixFalha, chaveSucesso, chaveFalha } = useSimulation()
  const [error, setError] = useState<string | null>(null)

  // Estados compartilhados para as simulações
  const [selectedWallet, setSelectedWallet] = useState('')
  const [simResult, setSimResult] = useState<any>(null)
  const [simError, setSimError] = useState<string | null>(null)

  const handleRecarga = () => {
    try {
      recargaBuckets()
      setError(null)
    } catch (err) {
      setError('Erro ao recarregar buckets')
      console.error(err)
    }
  }

  const handleRefresh = () => {
    // React atualiza sozinho
  }

  const handleDownloadCollection = () => {
    const link = document.createElement('a')
    link.href = '/bff/postman-collection'
    link.download = 'Simulador_Fichas_Bacen.postman_collection.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const runSimulation = (e: React.FormEvent, action: Function, actionName: string) => {
    e.preventDefault()
    if (!selectedWallet) {
      setSimError('Por favor, selecione uma wallet')
      return
    }

    try {
      setSimError(null)
      const response = action(selectedWallet)
      setSimResult({ ...response, actionName })
    } catch (err: any) {
      setSimError(err.response?.data?.message || err.message || `Erro ao processar ${actionName}`)
      setSimResult(null)
    }
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  if (!dashboardData) {
    return <Alert variant="warning">Nenhum dado disponível</Alert>
  }

  const wallets = dashboardData.clients.map((c, i) => ({ id: c.id, name: `Cliente ${i + 1}` }))

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Dashboard de Buckets</h1>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={handleDownloadCollection}
            title="Download Postman Collection"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
            </svg>{' '}
            Postman
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={handleRefresh}
          >
            Atualizar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleRecarga}
          >
            Recarregar Buckets
          </Button>
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h3>Buckets dos Clientes</h3>
            </Card.Header>
            <Card.Body>
              <Row>
                {dashboardData.clients.map((client, index) => (
                  <Col md={4} key={client.id} className="mb-3">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title>Cliente {index + 1}</Card.Title>
                        <Card.Text>
                          <strong>ID:</strong> {client.id.substring(0, 8)}...<br />
                          <strong>Bucket:</strong> {client.balde} fichas
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h3>Bucket ISPB</h3>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <strong>ISPB:</strong> {dashboardData.ispb.ISPB}<br />
                <strong>Bucket:</strong> {dashboardData.ispb.balde} fichas
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h3>Status dos Buckets</h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center">
                    <h4>Buckets Clientes</h4>
                    <p className="display-4">{dashboardData.clients[0].balde}</p>
                    <p>fichas</p>
                    <div className="progress">
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${(dashboardData.clients[0].balde / 100) * 100}%` }}
                      >
                        {dashboardData.clients[0].balde}%
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <h4>Bucket ISPB</h4>
                    <p className="display-4">{dashboardData.ispb.balde}</p>
                    <p>fichas</p>
                    <div className="progress">
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{ width: `${(dashboardData.ispb.balde / 300) * 100}%` }}
                      >
                        {Math.round((dashboardData.ispb.balde / 300) * 100)}%
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <h4>Status Geral</h4>
                    {dashboardData.clients[0].balde > 20 && dashboardData.ispb.balde >= 3 ? (
                      <span className="badge bg-success fs-5">Operacional</span>
                    ) : (
                      <span className="badge bg-danger fs-5">Limitado</span>
                    )}
                    <p className="mt-2">
                      {dashboardData.clients[0].balde > 20 && dashboardData.ispb.balde >= 3
                        ? 'Sistema operando normalmente'
                        : 'Sistema com restrições de transação'}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h3>Simulador de Operações</h3>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-4">
                <Form.Label><strong>Selecione a Wallet (Cliente) para simular:</strong></Form.Label>
                <Form.Select 
                  value={selectedWallet} 
                  onChange={(e) => {
                    setSelectedWallet(e.target.value)
                    setSimResult(null)
                    setSimError(null)
                  }}
                >
                  <option value="">Escolha uma wallet</option>
                  {wallets.map(wallet => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} - {wallet.id.substring(0, 8)}...
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {simError && <Alert variant="danger">{simError}</Alert>}
              
              {simResult && (
                <Alert variant={simResult.message.includes('sucesso') || simResult.message.includes('encontrada') ? 'success' : 'danger'}>
                  <h5>Resultado ({simResult.actionName}):</h5>
                  <p><strong>Mensagem:</strong> {simResult.message}</p>
                  {simResult.wallet && <p><strong>Bucket Cliente:</strong> {simResult.wallet.balde} fichas</p>}
                  {simResult.wallets && <p><strong>Bucket Cliente:</strong> {simResult.wallets.balde} fichas</p>}
                  {simResult.ispb !== undefined && <p><strong>Bucket ISPB:</strong> {simResult.ispb} fichas</p>}
                </Alert>
              )}

              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>PIX - Sucesso</Accordion.Header>
                  <Accordion.Body>
                    <p>Simula uma transação PIX bem-sucedida, consumindo 1 ficha do ISPB e 10 fichas do Cliente.</p>
                    <Button variant="success" onClick={(e) => runSimulation(e, pixSucesso, 'PIX Sucesso')} disabled={!selectedWallet}>
                      Executar Transação
                    </Button>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>PIX - Falha</Accordion.Header>
                  <Accordion.Body>
                    <p>Simula uma transação PIX que falha (ex: saldo insuficiente). Consome 1 ficha do ISPB, mas não consome do Cliente.</p>
                    <Button variant="danger" onClick={(e) => runSimulation(e, pixFalha, 'PIX Falha')} disabled={!selectedWallet}>
                      Executar Transação
                    </Button>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Consulta Chave - Sucesso</Accordion.Header>
                  <Accordion.Body>
                    <p>Simula a consulta de uma chave PIX com sucesso. Consome apenas 1 ficha do Cliente (ISPB não é cobrado).</p>
                    <Button variant="success" onClick={(e) => runSimulation(e, chaveSucesso, 'Consulta Chave Sucesso')} disabled={!selectedWallet}>
                      Executar Consulta
                    </Button>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                  <Accordion.Header>Consulta Chave - Falha</Accordion.Header>
                  <Accordion.Body>
                    <p>Simula a consulta de uma chave PIX inexistente. Consome apenas 1 ficha do Cliente (ISPB não é cobrado).</p>
                    <Button variant="danger" onClick={(e) => runSimulation(e, chaveFalha, 'Consulta Chave Falha')} disabled={!selectedWallet}>
                      Executar Consulta
                    </Button>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard