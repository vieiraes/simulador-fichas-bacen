import { Request, Response } from "express"
import express from 'express'
import axios from 'axios'

const router = express.Router()

// PIX bem-sucedido
router.post('/sucesso', async (req: Request, res: Response) => {
  try {
    const { walletId } = req.query
    
    // Chamar o endpoint existente para PIX bem-sucedido
    const response = await axios.post(`${process.env.URL}/pix/sucesso?walletId=${walletId}`)
    
    res.status(response.status).json(response.data)
  } catch (error: any) {
    console.error('Erro ao processar PIX bem-sucedido:', error)
    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      res.status(500).json({ message: 'Erro ao processar PIX bem-sucedido' })
    }
  }
})

// PIX malsucedido (chave inválida)
router.post('/falha', async (req: Request, res: Response) => {
  try {
    const { walletId } = req.query
    
    // Chamar o endpoint existente para PIX malsucedido
    const response = await axios.post(`${process.env.URL}/pix/falha?walletId=${walletId}`)
    
    res.status(response.status).json(response.data)
  } catch (error: any) {
    console.error('Erro ao processar PIX malsucedido:', error)
    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      res.status(500).json({ message: 'Erro ao processar PIX malsucedido' })
    }
  }
})

export { router }