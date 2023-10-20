import express from 'express'
require('dotenv').config()
import { router } from './routes'

const port: number = Number(process.env.PORT) || 3000
const app = express()


app.use(express.json())
app.use(router)


function bootstrap(): undefined {
    const server = app.listen(port)
    if (server) {
        console.log(`Servidor está rodando na porta ${port} 🚀`)
    } else {
        console.log(`Servidor falhou ao iniciar 😥`)
        process.exit(1)
    }
    return undefined
}


bootstrap()


