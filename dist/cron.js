"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cron_1 = require("cron");
const axios_1 = __importDefault(require("axios"));
const Pix_controller_1 = require("./controllers/Pix.controller");
async function execute(walletid) {
    try {
        const response = await axios_1.default.post(`http://localhost:3000/pix/balde/recharge?walletId=${walletid}`);
        console.log(response.data);
    }
    catch (error) {
        console.error(error);
    }
}
const job = new cron_1.CronJob('*/2 * * * * *', async () => {
    const promises = Pix_controller_1.wallets.map(w => execute(w.id));
    await Promise.all(promises);
    console.log('cron running a task every 2 seconds');
}, null, true, 'America/Sao_Paulo');
job.start();
//# sourceMappingURL=cron.js.map