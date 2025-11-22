import { Request, Response } from "express"
import express from 'express'
import axios from 'axios'

const router = express.Router()

// Recarga de buckets
router.post('/', async (req: Request, res: Response) => {
  try {
    // Chamar o endpoint existente para recarga de buckets
    const response = await axios.post(`${process.env.URL}/pix/balde/recarga`)
    
    res.status(response.status).json(response.data)
  } catch (error: any) {
    console.error('Erro ao processar recarga de buckets:', error)
    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      res.status(500).json({ message: 'Erro ao processar recarga de buckets' })
    }
  }
})

export { router }