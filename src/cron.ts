import { CronJob } from 'cron'
import axios from 'axios'
require('dotenv').config()


async function execute(): Promise<void> {
    try {
        const response = await axios.post(`${process.env.URL}/pix/balde/recarga`)
        console.log(response.data)

    } catch (error) {
        console.error(error)
    }
    return undefined
}

const job = new CronJob(`0 */${process.env.CRON} * * * *`, async () => {
    execute()
    console.log(`cron running a task every ${process.env.CRON} minutes`)
}, null, true, 'America/Sao_Paulo')

job.start()
