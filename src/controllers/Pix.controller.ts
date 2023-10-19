import { Request, Response } from "express"
import express from 'express'
require('dotenv').config()

const router = express.Router()

const wallet1 = { id: "469834d9-61b0-4893-81c1-94418f300e0a", balde: Number(process.env.MAX_TOKENS) }
const wallet2 = { id: "d2dde215-98d8-43be-954f-384ed8c3de4c", balde: Number(process.env.MAX_TOKENS) }
const wallet3 = { id: "cf82633d-71f9-4ff0-ab3e-7a8163d3fc06", balde: Number(process.env.MAX_TOKENS) }
export let wallets = [wallet1, wallet2, wallet3]

//AXIOS
router.post('/balde', (req: Request, res: Response) => {
    const { wallet } = req.query

    const walletReturn = wallets.find(w => w.id === wallet)

    if (walletReturn.balde < Number(process.env.MAX_TOKENS)) {
        walletReturn.balde += 2
        res.status(201).json({
            message: "2 fichas recuperadas no balde",
            walletReturn
        })
    }
    if (walletReturn.balde == Number(process.env.MAX_TOKENS)) {
        res.status(200).json({
            message: "Limite do balde atingido",
            "BACEN": "ENTRIES_READ_USER_ANTISCAN_V2",
            walletReturn
        })
    }
    if (!walletReturn) {
        res.status(404).json({ message: "Wallet não encontrada", walletReturn })
    }
})


router.get('/balde', (req: Request, res: Response) => {
    res.status(200).json(wallets)
})


router.post('/success', (req: Request, res: Response) => {
    const { wallet } = req.query

    const walletReturn = wallets.find(w => w.id === wallet)

    if (walletReturn.balde < 21) {
        res.status(400).json({ "message": 'Pix não permitido. Saldo do balde insuficiente', walletReturn })
    }
    if (walletReturn.balde > 20) {
        walletReturn.balde -= 1
        res.status(201).json({ "message": 'Pix efetuado com sucesso.', walletReturn })
        walletReturn.balde += 1
    }

    if (!walletReturn) {
        res.status(404).json({ message: "Wallet não encontrada", walletReturn })
    }
})


router.post('/fail', (req: Request, res: Response) => {
    const { wallet } = req.query

    const walletReturn = wallets.find(w => w.id === wallet)

    if (walletReturn.balde < 20) {
        res.status(429).json({
            "message": 'Pix não permitido. Saldo do balde insuficiente',
            "BACEN": "ENTRIES_READ_USER_ANTISCAN_V2",
            walletReturn
        })
    }
    if (walletReturn.balde >= 20) {
        walletReturn.balde -= 20
        res.status(400).json({ "message": 'Pix não efeutado. Chave inválida.', walletReturn })
    }
    if (!walletReturn) {
        res.status(404).json({ message: "Wallet não encontrada." })
    }
})


export { router }