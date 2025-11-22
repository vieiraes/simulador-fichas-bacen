import axios from 'axios'

const API_BASE_URL = '/bff'

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

interface TransactionResponse {
  message: string
  wallet?: Wallet
  ispb?: number
  wallets?: Wallet
}

const apiService = {
  // Dashboard
  getDashboard: async (): Promise<DashboardData> => {
    const response = await axios.get<DashboardData>(`${API_BASE_URL}/dashboard`)
    return response.data
  },

  // Recarga de buckets
  recargaBuckets: async (): Promise<TransactionResponse> => {
    const response = await axios.post<TransactionResponse>(`${API_BASE_URL}/recarga`)
    return response.data
  },

  // Operações PIX
  pixSucesso: async (walletId: string): Promise<TransactionResponse> => {
    const response = await axios.post<TransactionResponse>(
      `${API_BASE_URL}/pix/sucesso?walletId=${walletId}`
    )
    return response.data
  },

  pixFalha: async (walletId: string): Promise<TransactionResponse> => {
    const response = await axios.post<TransactionResponse>(
      `${API_BASE_URL}/pix/falha?walletId=${walletId}`
    )
    return response.data
  },

  // Operações de Chave
  chaveSucesso: async (walletId: string): Promise<TransactionResponse> => {
    const response = await axios.get<TransactionResponse>(
      `${API_BASE_URL}/chave/sucesso?walletId=${walletId}`
    )
    return response.data
  },

  chaveFalha: async (walletId: string): Promise<TransactionResponse> => {
    const response = await axios.get<TransactionResponse>(
      `${API_BASE_URL}/chave/falha?walletId=${walletId}`
    )
    return response.data
  }
}

export default apiService