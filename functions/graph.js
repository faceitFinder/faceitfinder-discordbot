const { color } = require('../config.json')
const path = require('path')
const Canvas = require('canvas')

const generateCanvas = async (elo = null, matchHistory, playerElo, maxMatch = 20) => {
  if (elo === null)
    try { elo = await getElo(maxMatch, matchHistory, playerElo) }
    catch (error) { throw error }
  if (elo.length === 0) throw 'No match found on this date'

  elo.reverse()

  const padding = 100
  const width = padding * (elo.length + 1)
  const height = Math.max(...elo) - Math.min(...elo) + padding * 2

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
  for (let i = 0; i < elo.length + 1; i++) {
    ctx.beginPath()
    ctx.moveTo(padding * i, 0)
    ctx.lineTo(padding * i, height)
    ctx.stroke()
  }

  ctx.globalCompositeOperation = 'source-over'

  /**
   * Elo bar
   */
  elo.forEach((current, i) => {
    const prev = elo[i - 1] === undefined ? current : elo[i - 1]
    const coordinatesStart = { x: padding * i, y: Math.max(...elo) - elo[i - 1] + padding }
    const coordinatesEnd = { x: padding * (i + 1), y: Math.max(...elo) - current + padding }
    const [level, values] = Object.entries(color.levels).filter(fc => current >= fc[1].min && current <= fc[1].max)[0]

    ctx.font = '30px sans-serif'
    ctx.lineWidth = 5
    ctx.fillStyle = values.color
    ctx.strokeStyle = getColors(prev, current, ctx, coordinatesStart, coordinatesEnd)

    ctx.beginPath()
    ctx.moveTo(coordinatesStart.x, coordinatesStart.y)
    ctx.lineTo(coordinatesEnd.x, coordinatesEnd.y)
    ctx.stroke()

    ctx.fillText(current, padding * i + padding / 1.5, height)
  })

  return canvas
}

const getRankImage = async (faceitLevel, size) => {
  const image = await Canvas.loadImage(
    path.resolve(__dirname, `../images/faceit/faceit${faceitLevel}.svg`))
  image.height = image.width = size

  return image
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

const getElo = async (maxMatch, matchHistory, playerElo, checkElo = 1) => {
  const currentElo = { elo: playerElo }

  if (matchHistory.length > 0 && checkElo) {
    if (matchHistory[0].elo === undefined)
      matchHistory[0] = currentElo
    else if (matchHistory[0].elo != playerElo)
      matchHistory.unshift(currentElo)
  } else if (matchHistory.length === 0) throw 'Couldn\'t get today matches'

  const elo = Array.from(matchHistory, e => e.elo)
  elo.reverse().forEach((e, i) => {
    if (e === undefined && elo[i - 1] !== undefined) elo[i] = elo[i - 1]
  })

  return elo.filter(e => e !== undefined).reverse().slice(0, maxMatch)
}

module.exports = {
  generateCanvas,
  getRankImage,
  getElo,
}
