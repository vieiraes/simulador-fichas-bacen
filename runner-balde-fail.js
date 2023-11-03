import http from 'k6/http'
import { check, group } from 'k6'
import { walletRandom } from './utils/utils.js'

export let options = {
    noConnectionReuse: true,
    noVUConnectionReuse: true,
    scenarios: {
        Fail_Interation: {
            startTime: '120s',
            executor: 'constant-arrival-rate',
            preAllocatedVUs: 2,
            rate: 15,
            timeUnit: '1m',
            duration: '15m',
            gracefulStop: '20s',
        },

        // Teste_ramping: {
        //     executor: 'ramping-arrival-rate', // nao se coloca o sleep()
        //     startRate: 0,
        //     timeUnit: '1m',
        //     preAllocatedVUs: 1,
        //     maxVUs: 1,
        //     stages: [
        //         { target: 10, duration: '1m' },
        //     ],
        // },
    }
}
export default function () {
    const url = 'http://web:3000'
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    }
    const arrayWallets = ['469834d9-61b0-4893-81c1-94418f300e0a', 'd2dde215-98d8-43be-954f-384ed8c3de4c', 'cf82633d-71f9-4ff0-ab3e-7a8163d3fc06']

    ///////////////////////////////////////////////////
    group('PIX', () => {
        group('PIX FAIL', function () {
            const res = http.post(`${url}/pix/falha?walletId=${walletRandom(arrayWallets)}`, JSON.stringify({}), params)
            // const status = 
            check(res, { 'status was 429': (r) => r.status == 429 })
            // if (!status) {
            console.log(`PIX FAIL Status:${res.status} `)
            // }
        })
    })

    //////////////////////////////////////////////////

    group('GET KEY', () => {
        // for (let i = 0; i < 3; i++) {
        group('GET KEY SUCCESS', function () {
            const res = http.get(`${url}/chave/sucesso?walletId=${walletRandom(arrayWallets)}`, JSON.stringify({}), params)
            const status = check(res, { 'status was 201': (r) => r.status == 201 })
            // if (!status) {
            console.log(`GET KEY SUCCESS Status:${res.status} `)
            // }
        })
        // }

        // group('GET KEY FAIL', function () {
        //     const res = http.get(`${url}/chave/falha?walletId=${walletRandom(arrayWallets)}`, JSON.stringify({}), params)
        //     const status = check(res, { 'status was 420': (r) => r.status == 429 })
        //     if (!status) {
        //         console.log(`GET KEY FAIL Status:${res.status} `)
        //     }
        // })
    })
}