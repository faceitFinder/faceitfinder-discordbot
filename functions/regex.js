const Big = require('big.js')

const findSteamUIds = (str) => {
  const regex = /STEAM_([0-9]):([0-9]):([0-9]*)/gi
  const staticBin = '000100000000000000000001'
  const res = []

  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex)
      regex.lastIndex++

    const binaryId = `${decToBin(m[1], 8)}${staticBin}${decToBin(m[3], 32)}${m[2]}`
    res.push(binToDec(binaryId).toString())
  }
  return res
}

const binToDec = (num) => {
  const bin = num.split('').reverse()
  let pow = new Big(0)

  for (let i = 0; i < bin.length; i++)
    if (bin[i] == 1)
      pow = pow.plus(new Big(2).pow(i))

  return pow
}

const decToBin = (num, len) => {
  if (num === 0)
    return 0
  const bin = []
  while (num > 0) {
    let rem = num % 2
    bin.push(rem)
    num = (num / 2) === 0.5 ? 0 : Math.floor(num / 2)
  }

  while (bin.length !== len - 1)
    bin.push(0)

  return bin.reverse().join('')
}

module.exports = {
  findSteamUIds,
}