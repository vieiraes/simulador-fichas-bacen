import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Spinner, Alert } from 'react-bootstrap'
import apiService from '../services/api'

interface Wallet {
  id: string
  balde: number
}

interface ISPB {
  ISPB: string
  balde: number
}

interface DashboardData {
  clients: Wallet[]
  ispb: ISPB
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await apiService.getDashboard()
        setDashboardData(data)
        setError(null)
      } catch (err) {
        setError('Erro ao carregar dados do dashboard')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRecarga = async () => {
    try {
      setLoading(true)
      await apiService.recargaBuckets()
      // Recarregar os dados após a recarga
      const data = await apiService.getDashboard()
      setDashboardData(data)
      setError(null)
    } catch (err) {
      setError('Erro ao recarregar buckets')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const data = await apiService.getDashboard()
      setDashboardData(data)
    } catch (err) {
      console.error('Error refreshing dashboard:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDownloadCollection = () => {
    const link = document.createElement('a')
    link.href = '/bff/postman-collection'
    link.download = 'Simulador_Fichas_Bacen.postman_collection.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading && !dashboardData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    )
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  if (!dashboardData) {
    return <Alert variant="warning">Nenhum dado disponível</Alert>
  }

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
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{' '}
                Atualizando...
              </>
            ) : (
              'Atualizar'
            )}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleRecarga}
            disabled={loading}
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
                Recarregando...
              </>
            ) : (
              'Recarregar Buckets'
            )}
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
                        aria-valuenow={dashboardData.clients[0].balde}
                        aria-valuemin={0}
                        aria-valuemax={100}
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
                        aria-valuenow={dashboardData.ispb.balde}
                        aria-valuemin={0}
                        aria-valuemax={300}
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
    </div>
  )
}

export default Dashboard