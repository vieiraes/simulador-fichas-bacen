import { CronJob } from 'cron'
import axios from 'axios'
import { wallets } from './controllers/Pix.controller'
require('dotenv').config()


async function execute(walletid) {
    try {
        const response = await axios.post(`${process.env.URL}/pix/balde/recharge?walletId=${walletid}`)
        console.log(response.data)
        
    } catch (error) {
        console.error(error)
    }
}

const job = new CronJob('*/2 * * * * *', async () => {
    const promises = wallets.map(w => execute(w.id))
    await Promise.all(promises)
    console.log('cron running a task every 2 seconds')
}, null, true, 'America/Sao_Paulo')

job.start()
