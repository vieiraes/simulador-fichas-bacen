require('dotenv').config()

const wallet1 = { id: "469834d9-61b0-4893-81c1-94418f300e0a", balde: Number(process.env.BALDE_CNPJ) }
const wallet2 = { id: "d2dde215-98d8-43be-954f-384ed8c3de4c", balde: Number(process.env.BALDE_CNPJ) }
const wallet3 = { id: "cf82633d-71f9-4ff0-ab3e-7a8163d3fc06", balde: Number(process.env.BALDE_CNPJ) }


export let ISPB = { ISPB: String(process.env.ISPB), balde: Number(process.env.BALDE_ISPB) }
export let clientWallets = [wallet1, wallet2, wallet3]