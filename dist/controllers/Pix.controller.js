"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.wallets = void 0;
const express_1 = __importDefault(require("express"));
require('dotenv').config();
const router = express_1.default.Router();
exports.router = router;
const wallet1 = { id: "469834d9-61b0-4893-81c1-94418f300e0a", balde: Number(process.env.MAX_TOKENS) };
const wallet2 = { id: "d2dde215-98d8-43be-954f-384ed8c3de4c", balde: Number(process.env.MAX_TOKENS) };
const wallet3 = { id: "cf82633d-71f9-4ff0-ab3e-7a8163d3fc06", balde: Number(process.env.MAX_TOKENS) };
exports.wallets = [wallet1, wallet2, wallet3];
router.post('/balde/recharge', (req, res) => {
    const { walletId } = req.query;
    const wallet = exports.wallets.find(w => w.id === walletId);
    if (wallet.balde < Number(process.env.MAX_TOKENS)) {
        wallet.balde += 2;
        res.status(201).json({
            message: "2 fichas recuperadas no balde",
            wallet
        });
    }
    if (wallet.balde == Number(process.env.MAX_TOKENS)) {
        res.status(200).json({
            message: "Limite do balde atingido",
            "BACEN": "ENTRIES_READ_USER_ANTISCAN_V2",
            wallet
        });
    }
    if (!wallet) {
        res.status(404).json({ message: "Wallet não encontrada", wallet });
    }
});
router.get('/balde', (req, res) => {
    res.status(200).json(exports.wallets);
});
router.post('/success', (req, res) => {
    const { walletId } = req.query;
    const wallet = exports.wallets.find(w => w.id === walletId);
    if (wallet.balde < 21) {
        res.status(400).json({ "message": 'Pix não permitido. Saldo do balde insuficiente', wallet });
    }
    if (wallet.balde > 20) {
        wallet.balde -= 1;
        res.status(201).json({ "message": 'Pix efetuado com sucesso.', wallet });
        wallet.balde += 1;
    }
    if (!wallet) {
        res.status(404).json({ message: "Wallet não encontrada", wallet });
    }
});
router.post('/fail', (req, res) => {
    const { walletId } = req.query;
    const wallet = exports.wallets.find(w => w.id === walletId);
    if (wallet.balde < 20) {
        res.status(429).json({
            "message": 'Pix não permitido. Saldo do balde insuficiente',
            "BACEN": "ENTRIES_READ_USER_ANTISCAN_V2",
            wallet
        });
    }
    if (wallet.balde >= 20) {
        wallet.balde -= 20;
        res.status(400).json({ "message": 'Pix não efeutado. Chave inválida.', wallet });
    }
    if (!wallet) {
        res.status(404).json({ message: "Wallet não encontrada." });
    }
});
//# sourceMappingURL=Pix.controller.js.map