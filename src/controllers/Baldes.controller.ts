import { Request, Response } from "express"
import express from 'express'
require('dotenv').config()
import { clientWallets, ISPB } from "../models/wallets.model"

const router = express.Router()

interface IBaldes {
    clients: Object[],
    ISPB: Object
}

router.get('/saldos', (req: Request, res: Response) => {
    const obj: IBaldes = {
        "clients": clientWallets,
        "ISPB": ISPB
    }
    res.status(200).json(obj)
})

export { router } 