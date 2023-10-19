import express from 'express'
import { PixController } from './controllers'



const port: number = 3000
const app = express()
const router= express.Router()

app.use(express.json())
app.use(router)


function bootstrap(): void {
    const server = app.listen(port)
    if (server) {
        console.log(`Servidor está rodando na porta ${port} 🚀`)
    } else {
        console.log(`Servidor falhou ao iniciar 😥`)
        process.exit(1) 
    }
}

app.use('/pix', PixController)

bootstrap()


