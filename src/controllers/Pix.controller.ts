import { Request, Response } from "express"
import express from 'express'
require('dotenv').config()
import { clientWallets } from '../models/wallets.model'

const router = express.Router()


//AXIOS
router.post('/balde/recarga', (req: Request, res: Response) => {
    const { walletId } = req.query

    const wallet = clientWallets.find(w => w.id === walletId)

    if (wallet.balde < Number(process.env.BALDE_CNPJ)) {
        wallet.balde += 2
        res.status(201).json({
            message: "2 fichas recuperadas no balde",
            wallet
        })
    }
    if (wallet.balde >= Number(process.env.BALDE_CNPJ)) {
        wallet.balde = 1000
        res.status(200).json({
            message: "Limite do balde atingido",
            "BACEN": "ENTRIES_READ_USER_ANTISCAN_V2",
            wallet
        })
    }
    if (!wallet) {
        res.status(404).json({ message: "Wallet não encontrada", wallet })
    }
})

router.post('/sucesso', (req: Request, res: Response) => {
    const { walletId } = req.query

    const wallet = clientWallets.find(w => w.id === walletId)

    if (wallet.balde < 21) {
        res.status(400).json({ "message": 'Pix não permitido. Saldo do balde insuficiente', wallet })
    }
    if (wallet.balde > 20) {
        wallet.balde -= 1
        res.status(201).json({ "message": 'Pix efetuado com sucesso.', wallet })
        wallet.balde += 1
    }

    if (!wallet) {
        res.status(404).json({ message: "Wallet não encontrada", wallet })
    }
})


router.post('/falha', (req: Request, res: Response) => {
    const { walletId } = req.query

    const wallet = clientWallets.find(w => w.id === walletId)

    if (wallet.balde < 20) {
        res.status(429).json({
            "message": 'Pix não permitido. Saldo do balde insuficiente',
            "BACEN": "ENTRIES_READ_USER_ANTISCAN_V2",
            wallet
        })
    }
    if (wallet.balde >= 20) {
        wallet.balde -= 20
        res.status(400).json({ "message": 'Pix não efeutado. Chave inválida.', wallet })
    }
    if (!wallet) {
        res.status(404).json({ message: "Wallet não encontrada." })
    }
})


export { router }