import { CronJob } from 'cron'
import axios from 'axios'
import { wallets } from './controllers/Pix.controller'

async function execute(walletid) {
    try {
        const response = await axios.post(`http://localhost:3000/pix/balde?wallet=${walletid}`);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}


const job = new CronJob('*/2 * * * * *', () => {

    wallets.forEach(w => {
        execute(w.id)
    })

    console.log('cron running a task every 2 seconds')
},
    null, true, 'America/Sao_Paulo'
)

job.start()