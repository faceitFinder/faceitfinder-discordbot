const { color } = require('../config.json')
const path = require('path')
const Matches = require('./matches')
const Player = require('./player')
const Canvas = require('canvas')

const faceitEloColors = [
  { "min": 0, "max": 800, "color": color.levels[0] },
  { "min": 801, "max": 1100, "color": color.levels[1] },
  { "min": 1101, "max": 1700, "color": color.levels[3] },
  { "min": 1701, "max": 2000, "color": color.levels[7] },
  { "min": 2001, "max": 100000, "color": color.levels[9] },
]

const generateCanva = async (playerId) => {
  const playerDatas = await Player.getDatas(playerId)
  const elo = (await getElo(playerId)).reverse()

  const padding = 100
  const width = padding * (elo.length + 1)
  const height = Math.max(...elo) - Math.min(...elo) + padding * 2
  const titleOptions = { "x": 10, "y": 50, "fontSize": 50 }

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
   * Player name
   */
  ctx.fillStyle = '#fff'
  ctx.font = `${titleOptions.fontSize}px sans-serif`
  ctx.fillText(playerDatas.nickname, titleOptions.x, titleOptions.y)

  /**
   * Rank image
   */
  const image = await Canvas.loadImage(
    path.resolve(__dirname, `../images/faceit${playerDatas.games.csgo.skill_level_label}.svg`))
  image.height = image.width = titleOptions.fontSize
  ctx.drawImage(image, (titleOptions.x * 2) + ctx.measureText(playerDatas.nickname).width, titleOptions.x)


  ctx.globalCompositeOperation = 'source-over'

  /**
   * Elo bar
   */
  elo.forEach((e, i) => {
    const coordinatesStart = { x: padding * i, y: Math.max(...elo) - elo[i - 1] + padding }
    const coordinatesEnd = { x: padding * (i + 1), y: Math.max(...elo) - e + padding }
    const color = getColors(elo[i - 1], e, ctx, coordinatesStart, coordinatesEnd)

    ctx.font = '30px sans-serif'
    ctx.lineWidth = 5
    ctx.fillStyle = ctx.strokeStyle = color

    ctx.beginPath()
    ctx.moveTo(coordinatesStart.x, coordinatesStart.y)
    ctx.lineTo(coordinatesEnd.x, coordinatesEnd.y)
    ctx.stroke()

    ctx.fillText(e, padding * i + padding / 1.5, height)
  })

  return canvas.toBuffer()
}

const getColors = (current, next, ctx, coordinatesStart, coordinatesEnd) => {
  if (current === undefined) current = next
  const gradient = ctx.createLinearGradient(coordinatesStart.x, coordinatesStart.y, coordinatesEnd.x, coordinatesEnd.y)
  let value

  faceitEloColors.forEach((fc, i) => {
    if (current >= fc.min && current <= fc.max)
      if (next >= fc.min && next <= fc.max) value = fc.color
      else if (next > fc.max) {
        gradient.addColorStop(0, fc.color)
        gradient.addColorStop(0.5, faceitEloColors[i + 1].color)
        value = gradient
      } else if (next < fc.min) {
        gradient.addColorStop(0.5, fc.color)
        gradient.addColorStop(1, faceitEloColors[i - 1].color)
        value = gradient
      }
  })
  return value
}

const getElo = async (playerId) => {
  const data = await Matches.getMatches(playerId)
  return Array.from(data, e => e.elo).filter(e => e != undefined)
}

module.exports = {
  generateCanva
}
