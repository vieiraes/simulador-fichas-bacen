export function walletRandom(walletArray) {
    let item = walletArray[Math.floor(Math.random() * walletArray.length)]
    return item
}