import { CronJob } from 'cron'
import axios from 'axios'
import { clientWallets } from './api/models/wallets.model'
require('dotenv').config()


async function execute(walletid: string): Promise<void> {
    try {
        const response = await axios.post(`${process.env.URL}/pix/balde/recarga`)
        console.log(response.data)

    } catch (error) {
        console.error(error)
    }
    return undefined
}

const job = new CronJob(`0 */${process.env.CRON} * * * *`, async () => {
    const promises = clientWallets.map(w => execute(w.id))
    await Promise.all(promises)
    console.log(`cron running a task every ${process.env.CRON} minutes`)
}, null, true, 'America/Sao_Paulo')

job.start()
