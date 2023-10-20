import { Request, Response } from "express"
import express from 'express'
require('dotenv').config()
import { clientWallets } from "../models/wallets.model"

const router = express.Router()

router.get('/sucesso', (req: Request, res: Response) => {
    const { walletId } = req.query

    const wallet = clientWallets.find(w => w.id === walletId)

    if (wallet.balde <= 0) {
        wallet.balde = 0
        res.status(400).json({
            message: "Fichas insuficiente para consuta de chave no DICT.",
            wallet
        })
    }
    if (wallet.balde > 0) {
        wallet.balde -= 1
        res.status(201).json({
            message: "Chave consultada com sucesso.",
            wallet
        })
    }
    if (!wallet) {
        res.status(404).json({ message: "Wallet não encontrada", wallet })
    }
})


router.get('/falha', (req: Request, res: Response) => {
    const { walletId } = req.query

    const wallet = clientWallets.find(w => w.id === walletId)

    if (wallet.balde <= 0) {
        wallet.balde = 0
        res.status(400).json({
            message: "Fichas insuficiente para consuta de chave no DICT.",
            wallet
        })
    }
    if (wallet.balde > 0) {
        wallet.balde -= 20
        res.status(201).json({
            message: "Falha na consulta de chave.",
            wallet
        })
    }
    if (!wallet) {
        res.status(404).json({ message: "Wallet não encontrada", wallet })
    }
})



export { router } 