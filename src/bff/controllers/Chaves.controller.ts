import { Request, Response } from "express"
import express from 'express'
import axios from 'axios'

const router = express.Router()

// Consulta de chave bem-sucedida
router.get('/sucesso', async (req: Request, res: Response) => {
  try {
    const { walletId } = req.query
    
    // Chamar o endpoint existente para consulta de chave bem-sucedida
    const response = await axios.get(`${process.env.URL}/chave/sucesso?walletId=${walletId}`)
    
    res.status(response.status).json(response.data)
  } catch (error: any) {
    console.error('Erro ao processar consulta de chave bem-sucedida:', error)
    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      res.status(500).json({ message: 'Erro ao processar consulta de chave bem-sucedida' })
    }
  }
})

// Consulta de chave malsucedida (chave não encontrada)
router.get('/falha', async (req: Request, res: Response) => {
  try {
    const { walletId } = req.query
    
    // Chamar o endpoint existente para consulta de chave malsucedida
    const response = await axios.get(`${process.env.URL}/chave/falha?walletId=${walletId}`)
    
    res.status(response.status).json(response.data)
  } catch (error: any) {
    console.error('Erro ao processar consulta de chave malsucedida:', error)
    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      res.status(500).json({ message: 'Erro ao processar consulta de chave malsucedida' })
    }
  }
})

export { router }