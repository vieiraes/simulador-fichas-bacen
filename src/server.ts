import express from 'express'
require('dotenv').config()
import { router } from './routes'
import { router as bffRouter } from './bff/routes'
import path from 'path'

const port: number = Number(process.env.PORT) || 3000
const app = express()

// Middleware para JSON
app.use(express.json())

// Rotas da API e BFF
app.use(router)
app.use('/bff', bffRouter)

// Servir arquivos estáticos do frontend com cache para produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend-build'), {
    maxAge: '1y',
    etag: false
  }))
} else {
  app.use(express.static(path.join(__dirname, '../frontend-build')))
}

// Rota para servir o frontend em todas as rotas não API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend-build/index.html'))
})

function bootstrap(): undefined {
    const server = app.listen(port, () => {
        console.log(`Servidor está rodando na porta ${port} 🚀`)
    })
    return undefined
}

bootstrap()


