const { color } = require('../config.json')
const path = require('path')
const Canvas = require('canvas')
const CustomType = require('../templates/customType.js')

const generateCanvas = (array = null, matchHistory, playerElo, maxMatch = 20, type = CustomType.TYPES.ELO) => {
  if (array === null)
    try { array = getElo(maxMatch, matchHistory, playerElo) }
    catch (error) { throw error }
  if (array.length === 0) throw 'No match found on this date'

  array.reverse()

  const padding = 100
  const width = padding * (array.length + 1)
  const height = Math.max(...array) - Math.min(...array) + padding * 2

  const canvas = Canvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  
  /**
   * Background
   */
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#2f3136'
  ctx.fillRect(0, 0, width, height)

  ctx.globalCompositeOperation = 'source-over'
  ctx.strokeStyle = '#383838'
  ctx.lineWidth = 5

  ctx.globalCompositeOperation = 'source-over'

  /**
   * Grid
   */
  for (let i = 0; i < array.length + 1; i++) {
    ctx.beginPath()
    ctx.moveTo(padding * i, 0)
    ctx.lineTo(padding * i, height)
    ctx.stroke()
  }

  ctx.globalCompositeOperation = 'source-over'

  /**
   * Elo bar
   */
  array.forEach((current, i) => {
    const prev = array[i - 1] === undefined ? current : array[i - 1]
    const coordinatesStart = { x: padding * i, y: (Math.max(...array) - array[i - 1] + padding) }
    const coordinatesEnd = { x: padding * (i + 1), y: (Math.max(...array) - current + padding) }
    const [level, values] = Object.entries(color.levels).filter(fc => current >= fc[1].min && current <= fc[1].max)[0]

    ctx.font = '30px sans-serif'
    ctx.lineWidth = 5
    ctx.fillStyle = values.color
    ctx.strokeStyle = getColors(prev, current, ctx, coordinatesStart, coordinatesEnd)

    ctx.beginPath()
    ctx.moveTo(coordinatesStart.x, coordinatesStart.y)
    ctx.lineTo(coordinatesEnd.x, coordinatesEnd.y)
    ctx.stroke()

    ctx.fillText(parseFloat(current / type.g).toFixed(type.f), padding * i + padding / 1.5, height)
  })

  return canvas
}

const getRankImage = async (faceitLevel, faceitElo, size) => {
  const space = 6,
    maxWidth = size - space,
    height = 4,
    x = space * .6,
    y = size + space * 1.2,
    canvas = Canvas.createCanvas(size, y + height + 1),
    image = await Canvas.loadImage(path.resolve(__dirname, `../images/faceit/faceit${faceitLevel}.svg`))

  image.height = image.width = size

  let ctx = canvas.getContext('2d')

  ctx.drawImage(image, 0, 0)
  ctx.lineWidth = space
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = ctx.strokeStyle = '#1f1f22'
  ctx = roundRect(ctx, x, y, maxWidth, height, space)

  const range = color.levels[faceitLevel],
    width = faceitLevel === 10 ? maxWidth : (maxWidth * (faceitElo - range.min) / (range.max - range.min))

  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = ctx.strokeStyle = color.levels[faceitLevel].color
  ctx = roundRect(ctx, x, y, width, height, space)

  return canvas
}

const roundRect = (ctx, x, y, w, h, r) => {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.fill()

  return ctx
}

const getColors = (prev, current, ctx, coordinatesStart, coordinatesEnd) => {
  const gradient = ctx.createLinearGradient(coordinatesStart.x, coordinatesStart.y, coordinatesEnd.x, coordinatesEnd.y)
  const [prevLevel, prevValues] = Object.entries(color.levels).filter(fc => prev >= fc[1].min && prev <= fc[1].max)[0]

  if (current >= prevValues.min && current <= prevValues.max) gradient.addColorStop(0, prevValues.color)
  else if (current > prevValues.max) {
    gradient.addColorStop(0, prevValues.color)
    gradient.addColorStop(0.5, color.levels[parseInt(prevLevel) + 1].color)
  } else if (current < prevValues.min) {
    gradient.addColorStop(0.5, prevValues.color)
    gradient.addColorStop(1, color.levels[parseInt(prevLevel) - 1].color)
  }

  return gradient
}

const getElo = (maxMatch, matchHistory, playerElo, checkElo = true) => {
  const currentElo = { elo: playerElo }

  if (matchHistory.length > 0 && checkElo) {
    if (matchHistory[0].elo === undefined)
      matchHistory[0] = currentElo
    else if (matchHistory[0].elo != playerElo)
      matchHistory.unshift(currentElo)
  } else if (matchHistory.length === 0) throw 'Couldn\'t get matchs'

  const elo = matchHistory.map(e => e.elo)
  elo.reverse().forEach((e, i) => {
    if (e === undefined && elo[i - 1] !== undefined) elo[i] = elo[i - 1]
  })

  return elo.filter(e => e !== undefined).reverse().slice(0, maxMatch)
}

const getKD = (matchHistory, maxMatch = 20) => {
  if (matchHistory.length === 0) throw 'Couldn\'t get matchs'
  return matchHistory.map(e => parseFloat(e.c2).toFixed(CustomType.TYPES.KD.f) * CustomType.TYPES.KD.g).slice(0, maxMatch)
}

module.exports = {
  generateCanvas,
  getRankImage,
  getElo,
  getKD
}
