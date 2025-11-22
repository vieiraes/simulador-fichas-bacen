import { Request, Response } from "express"
import express from 'express'
import axios from 'axios'

const router = express.Router()

interface DashboardData {
  clients: Array<{ id: string; balde: number }>;
  ispb: { ISPB: string; balde: number };
}

router.get('/', async (req: Request, res: Response) => {
  try {
    // Chamar o endpoint existente para obter os saldos
    const response = await axios.get(`${process.env.URL}/balde/saldos`)
    
    const dashboardData: DashboardData = {
      clients: response.data.clients,
      ispb: response.data.ISPB
    }
    
    res.status(200).json(dashboardData)
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    res.status(500).json({ message: 'Erro ao buscar dados do dashboard' })
  }
})

export { router }