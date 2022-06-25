const { color } = require('../config.json')
const path = require('path')
const Canvas = require('canvas')
const CustomType = require('../templates/customType')
const Chart = require('chart.js')

const generateChart = (matchHistory, playerElo, maxMatch = 20, type = CustomType.TYPES.ELO, check) => {
  const datas = []
  const types = type.name.split('-').map(e => {
    return CustomType.getType(e.trim())
  })

  datas.push(...types.map(type => [type, getGraph(type, matchHistory, playerElo, maxMatch, check).reverse()]))
  if (datas.length === 0) throw 'No match found on this date'

  return getChart(datas, matchHistory, maxMatch)
}

const getChart = (datasets, matchHistory, maxMatch) => {
  const canvas = Canvas.createCanvas(600, 400)
  const ctx = canvas.getContext('2d')

  const labels = matchHistory.map(match => new Date(match.date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }))
  const color = '#c9d1d9', gridColor = '#3c3c3c'
  const yAxisBase = {
    grid: {
      color: gridColor,
      borderWidth: 1,
    },
    ticks: {
      beginAtZero: false,
      color: color,
    }
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.slice(0, maxMatch).reverse(),
      datasets: datasets.map((datas, i) => {
        const [type, data] = datas
        return {
          label: type.name,
          data: data,
          fill: i === 0,
          yAxisID: `y${i}`,
          borderColor: (segment) => {
            if (segment.raw) return colorFilter(type.color, segment.raw).color
          },
          pointBackgroundColor: (segment) => {
            if (segment.raw) return colorFilter(type.color, segment.raw).color
          },
          segment: {
            borderColor: (segment) => {
              const prev = segment.p0, current = segment.p1

              ctx.strokeStyle = getGradient(prev, current, ctx, type)
              ctx.lineWidth = 2
              ctx.beginPath()
              ctx.moveTo(prev.x, prev.y)
              ctx.lineTo(current.x, current.y)
              ctx.stroke()

              return 'transparent'
            },
            borderWidth: 1,
          }
        }
      })
    },
    options: {
      scales: {
        y0: {
          display: true,
          position: 'left',
          ...yAxisBase
        },
        y1: {
          display: datasets.length > 1,
          position: 'right',
          ...yAxisBase
        },
        x: {
          grid: {
            color: gridColor,
          },
          ticks: {
            color: color,
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: color,
            borderWidth: 1,
          }
        }
      }
    },
    plugins: [{
      beforeDraw: (chart) => {
        const ctx = chart.canvas.getContext('2d')
        ctx.save()
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = '#2f3136'
        ctx.fillRect(0, 0, chart.width, chart.height)
        ctx.restore()
      }
    }],
  })

  return canvas.toBuffer()
}

const getRankImage = async (faceitLevel, faceitElo = color.levels['3'].min, size) => {
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
    width = parseInt(faceitLevel) === 10 ? maxWidth : (maxWidth * (faceitElo - range.min) / (range.max - range.min))

  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = ctx.strokeStyle = color.levels[faceitLevel].color
  ctx = roundRect(ctx, x, y, width, height, space)

  return canvas.toBuffer()
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

const getElo = (maxMatch, matchHistory, playerElo, checkElo = true) => {
  if (matchHistory.length <= 0) throw 'Couldn\'t get matchs'
  else if (checkElo && matchHistory[0].elo === undefined) matchHistory[0].elo = playerElo

  const elo = matchHistory.map(e => e.elo)
  elo.reverse().forEach((e, i) => {
    if (e === undefined && elo[i - 1] !== undefined) elo[i] = elo[i - 1]
  })

  return elo.filter(e => e !== undefined).reverse().slice(0, maxMatch)
}

const getKD = (matchHistory, maxMatch) => {
  if (matchHistory.length === 0) throw 'Couldn\'t get matchs'
  return matchHistory.map(e => e.c2).slice(0, maxMatch)
}

const getGradient = (prev, current, ctx, type) => {
  const gradient = ctx.createLinearGradient(prev.x, prev.y, current.x, current.y)
  gradient.addColorStop(0, colorFilter(type.color, prev.raw).color)
  gradient.addColorStop(1, colorFilter(type.color, current.raw).color)
  return gradient
}

const colorFilter = (colors, value) => Object.entries(colors)
  .filter(color => parseFloat(value) >= parseFloat(color[1].min) && parseFloat(value) <= parseFloat(color[1].max))
  .at(0)
  .at(1)

const getGraph = (type, matchHistory, faceitElo, maxMatch, check = true) => {
  switch (type) {
    case CustomType.TYPES.ELO: return getElo(maxMatch, matchHistory, faceitElo, check)
    case CustomType.TYPES.KD: return getKD(matchHistory, maxMatch)
    default: break
  }
}

module.exports = {
  generateChart,
  getRankImage,
  getElo,
  getKD
}
