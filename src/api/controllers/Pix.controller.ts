import { Request, Response } from "express"
import express from 'express'
require('dotenv').config()
import { ISPB, clientWallets } from '../models/wallets.model'

const router = express.Router()

router.post('/balde/recarga', (req: Request, res: Response) => {
    clientWallets.forEach(client => {
        if (client.balde < Number(process.env.BALDE_CNPJ)) {
            client.balde += 2
            if (ISPB.balde < Number(process.env.BALDE_ISPB)) {
                ISPB.balde += 2
            }
            if (ISPB.balde >= Number(process.env.BALDE_ISPB)) {
                ISPB.balde = Number(process.env.BALDE_ISPB)
            }
        }
        if (client.balde >= Number(process.env.BALDE_CNPJ)) {
            client.balde = Number(process.env.BALDE_CNPJ)
        }
    })
    res.status(200).json({
        message: "Recarga de fichas executada.",
        wallets: clientWallets,
        ispb: ISPB.balde
    })
})


router.post('/sucesso', (req: Request, res: Response) => {
    const { walletId } = req.query
    const client = clientWallets.find(w => w.id === walletId)


    if (client.balde < 21) {
        res.status(400).json({
            "message": 'Pix não permitido. Saldo do balde CNPJ insuficiente',
            wallet: client,
            ispb: ISPB.balde
        })
    }
    if (ISPB.balde < 3) {
        res.status(400).json({
            "message": 'Pix não permitido. Saldo do balde ISPB insuficiente',
            wallet: client,
            ispb: ISPB.balde
        })
    }
    if (client.balde > 20 && ISPB.balde >= 3) {
        client.balde -= 1
        ISPB.balde -= 1
        res.status(201).json({
            "message": 'Pix efetuado com sucesso.',
            wallet: client,
            ispb: ISPB.balde
        })
        client.balde += 1
        ISPB.balde += 1
    }
    if (!client) {
        res.status(404).json({
            message: "Wallet não encontrada",
            wallet: client
        })
    }
})


router.post('/falha', (req: Request, res: Response) => {
    const { walletId } = req.query
    const client = clientWallets.find(w => w.id === walletId)

    if (client.balde < 21) {
        res.status(400).json({
            "message": 'Pix não permitido. Saldo do balde CNPJ insuficiente',
            wallet: client,
            ispb: ISPB.balde
        })
    }
    if (ISPB.balde < 3) {
        res.status(400).json({
            "message": 'Pix não permitido. Saldo do balde ISPB insuficiente',
            wallet: client,
            ispb: ISPB.balde
        })
    }

    if (client.balde > 20 && ISPB.balde >= 3) {
        client.balde -= 20
        ISPB.balde -= 3
        res.status(429).json({
            message: "Pix não efeutado por chave inválida.",
            wallets: client,
            ispb: ISPB.balde
        })
    }
    if (!client) {
        res.status(404).json({ message: "Wallet não encontrada." })
    }
})


export { router }