const Matches = require('./matches')
const Canvas = require('canvas')
const { color } = require('../config.json')

const generateCanva = async (playerId) => {
  const elo = await getElo(playerId)
  const padding = 80
  const width = padding * (elo.length + 1)
  const height = Math.max(...elo) - Math.min(...elo) + padding * 2

  const canvas = Canvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  /**
   * Background
   */
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#2f2f2f'
  ctx.fillRect(0, 0, width, height)

  ctx.globalCompositeOperation = 'source-over'
  ctx.strokeStyle = '#383838'
  ctx.lineWidth = 5

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
  elo.reverse().forEach((e, i) => {
    const coordinates = { x: padding * (i + 1), y: Math.max(...elo) - e + padding }

    if (e < 801) ctx.fillStyle = color.levels[0]
    else if (e >= 801 && e <= 1100) ctx.fillStyle = color.levels[1]
    else if (e >= 1101 && e <= 1700) ctx.fillStyle = color.levels[3]
    else if (e >= 1701 && e <= 2000) ctx.fillStyle = color.levels[7]
    else if (e >= 2001) ctx.fillStyle = color.levels[9]

    ctx.font = '30px sans-serif'
    ctx.lineWidth = 5
    ctx.strokeStyle = '#c5c5c5'

    ctx.beginPath()
    ctx.moveTo(padding * i, Math.max(...elo) - elo[i - 1] + padding)
    ctx.lineTo(coordinates.x, coordinates.y)
    ctx.stroke()
    ctx.fillText(e, padding * (i + 0.5), height)
  })

  return canvas.toBuffer()
}

const getElo = async (playerId) => {
  const data = await Matches.getMatches(playerId)
  return Array.from(data, e => e.elo).filter(e => e != undefined)
}

module.exports = {
  generateCanva
}
