import { Request, Response } from "express"
import express from 'express'
require('dotenv').config()
import { clientWallets, ISPB } from "../models/wallets.model"

const router = express.Router()

router.get('/sucesso', (req: Request, res: Response) => {
    const { walletId } = req.query

    const client = clientWallets.find(w => w.id === walletId)

    if (client.balde < 21) {
        res.status(400).json({
            "message": 'Consulta de chave não permitida. Saldo do balde CNPJ insuficiente',
            wallet: client,
            ispb: ISPB.balde
        })
    }
    if (ISPB.balde < 1) {
        res.status(400).json({
            "message": 'Consulta de chave não permitida. Saldo do balde ISPB insuficiente',
            wallet: client,
            ispb: ISPB.balde
        })
    }
    if (client.balde > 20 && ISPB.balde >= 3) {
        client.balde -= 1
        ISPB.balde -= 1
        res.status(201).json({
            "message": 'Consulta efetuada com sucesso.',
            wallet: client,
            ispb: ISPB.balde
        })
    }
    if (!client) {
        res.status(404).json({
            message: "Wallet não encontrada.",
            wallet: client
        })
    }

})


router.get('/falha', (req: Request, res: Response) => {
    const { walletId } = req.query

    const client = clientWallets.find(w => w.id === walletId)

    if (client.balde < 21) {
        res.status(400).json({
            "message": 'Consulta de chave não permitida. Saldo do balde CNPJ insuficiente',
            wallet: client,
            ispb: ISPB.balde
        })
    }
    if (ISPB.balde < 1) {
        res.status(400).json({
            "message": 'Consulta de chave não permitida. Saldo do balde ISPB insuficiente',
            wallet: client,
            ispb: ISPB.balde
        })
    }
    if (client.balde > 20 && ISPB.balde >= 3) {
        client.balde -= 20
        ISPB.balde -= 3
        res.status(429).json({
            "message": 'Consulta de chave não encontrada.',
            wallet: client,
            ispb: ISPB.balde
        })
    }
    if (!client) {
        res.status(404).json({
            message: "Wallet não encontrada.",
            wallet: client
        })
    }

})



export { router } 