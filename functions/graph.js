const { color } = require('../config.json')
const path = require('path')
const Canvas = require('canvas')
const CustomType = require('../templates/customType')
const Chart = require('chart.js/auto')
const { getTranslation } = require('../languages/setup')

const generateChart = (locale, playerName, matchHistory, maxMatch = 20, type = CustomType.TYPES.ELO, game) => {
  const datas = []
  const types = type.name.split('-').map(e => {
    return CustomType.getType(e.trim())
  })

  datas.push(...types.map(type => [type, getGraph(locale, playerName, type, matchHistory, maxMatch).reverse()]))

  const labels = matchHistory.map(match => new Date(match.date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }))

  return getChart(datas, labels.slice(0, maxMatch).reverse(), getClassicDatasets, datas.length > 1, game)
}

const getChart = (datasets, labels, datasetFunc, displayY1, game) => {
  const canvas = Canvas.createCanvas(600, 400)
  const ctx = canvas.getContext('2d')

  const yAxisBase = {
    border: {
      width: 1,
    },
    grid: {
      color: color.charts.grid,
    },
    ticks: {
      beginAtZero: false,
      color: color.charts.text,
    }
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets.map((datas, i) => datasetFunc(datas, i, ctx, game)),
    },
    options: {
      scales: {
        y0: {
          display: true,
          position: 'left',
          ...yAxisBase
        },
        y1: {
          display: displayY1,
          position: 'right',
          ...yAxisBase
        },
        x: {
          grid: {
            color: color.charts.grid,
          },
          ticks: {
            color: color.charts.text,
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: color.charts.text,
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
        ctx.fillStyle = color.charts.background
        ctx.fillRect(0, 0, chart.width, chart.height)
        ctx.restore()
      }
    }],
  })

  return canvas.toBuffer()
}

const getClassicDatasets = (datas, i, ctx, game) => {
  const [type, data] = datas
  return {
    label: type.name,
    data: data,
    fill: i === 0,
    yAxisID: `y${i}`,
    borderColor: (segment) => {
      if (segment.raw) return colorFilter(type.color[game] ?? type.color, segment.raw).color
    },
    pointBackgroundColor: (segment) => {
      if (segment.raw) return colorFilter(type.color[game] ?? type.color, segment.raw).color
    },
    spanGaps: true,
    segment: {
      borderColor: (segment) => {
        if (segment.p0.skip || segment.p1.skip) return 'rgb(0,0,0,0.2)'
        const prev = segment.p0, current = segment.p1

        ctx.strokeStyle = getGradient(prev, current, ctx, type, game)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(current.x, current.y)
        ctx.stroke()

        return 'transparent'
      },
      borderDash: (segment) => segment.p0.skip || segment.p1.skip ? [6, 6] : undefined,
      borderWidth: 1,
    }
  }
}

const getCompareDatasets = (datas, i, ctx, game) => {
  const [nickname, type, playerColor, data] = [...datas]
  return {
    label: nickname,
    data: data,
    fill: i === 0,
    yAxisID: 'y0',
    pointBackgroundColor: playerColor,
    borderColor: playerColor,
    segment: {
      borderDash: (segment) => segment.p0.skip || segment.p1.skip ? [6, 6] : undefined,
      borderColor: (segment) => {
        if (segment.p0.skip || segment.p1.skip) return 'rgb(0,0,0,0.2)'
      }
    },
    borderWidth: 2,
    spanGaps: true
  }
}

const getRankImage = async (faceitLevel, faceitElo = null, size, game) => {
  faceitElo ??= color.levels[game]['3'].min

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

  const range = color.levels[game][faceitLevel],
    width = parseInt(faceitLevel) === 10 ? maxWidth : (maxWidth * (faceitElo - range.min) / (range.max - range.min))

  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = ctx.strokeStyle = color.levels[game][faceitLevel].color
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

const getElo = (maxMatch, matchHistory) => matchHistory.map(e => e?.elo).slice(0, maxMatch)

const getEloGain = (maxMatch, matchHistory) => matchHistory.map(e => e?.eloGain).slice(0, maxMatch)

const getKD = (maxMatch, matchHistory) => matchHistory.map(e => e?.c2).slice(0, maxMatch)

const getGradient = (prev, current, ctx, type, game) => {
  const gradient = ctx.createLinearGradient(prev.x, prev.y, current.x, current.y)
  gradient.addColorStop(0, colorFilter(type.color[game] ?? type.color, prev.raw).color)
  gradient.addColorStop(1, colorFilter(type.color[game] ?? type.color, current.raw).color)
  return gradient
}

const colorFilter = (colors, value) => {
  return Object.entries(colors)
    .filter(color => parseFloat(value) >= parseFloat(color[1].min) && parseFloat(value) <= parseFloat(color[1].max))
    .at(0)
    .at(1)
}

const getGraph = (locale, playerName, type, matchHistory, maxMatch) => {
  if (!matchHistory.length > 0) throw getTranslation('error.user.noMatches', locale, {
    playerName: playerName
  })

  switch (CustomType.getType(type.name)) {
  case CustomType.TYPES.ELO: return getElo(maxMatch, matchHistory)
  case CustomType.TYPES.KD: return getKD(maxMatch, matchHistory)
  default: break
  }
}

const getMapRadarChart = (segments, types) => {
  const canvas = Canvas.createCanvas(600, 600)
  const ctx = canvas.getContext('2d')
  const datasetsKeys = types.map(e => e.name)

  const thresholdLines = datasetsKeys
    .flatMap(key => {
      const threshold = color.charts.radarCategories[key]?.threshold
      if (!threshold) return []
      const lines = threshold.lines || (threshold.value ? [{ value: threshold.value, lineWidth: threshold.lineWidth || 2, lineColor: threshold.lineColor || '#6b7280' }] : [])
      return lines.map(line => ({ ...line, categoryKey: key, thresholdConfig: threshold }))
    })
    .filter((line, index, self) =>
      index === self.findIndex(l => l.value === line.value)
    )

  const customGridLines = datasetsKeys
    .flatMap(key => color.charts.radarCategories[key]?.gridLines || [])
    .filter((line, index, self) =>
      index === self.findIndex(l => l.value === line.value)
    )

  const getThresholdConfig = (tickValue) => {
    return thresholdLines.find(t => t.value === tickValue)
  }

  const getGridLineProperty = (tickValue, property, defaultCustomValue, defaultThresholdValue, fallbackValue) => {
    const customLine = customGridLines.find(line => line.value === tickValue)
    if (customLine) {
      return customLine[property] || defaultCustomValue
    }
    const thresholdLine = getThresholdConfig(tickValue)
    if (thresholdLine) {
      const thresholdProperty = property === 'color' ? 'lineColor' : property
      return thresholdLine[thresholdProperty] || defaultThresholdValue
    }
    return fallbackValue
  }

  const getGridLineColor = (tickValue) => {
    return getGridLineProperty(tickValue, 'color', color.charts.grid, '#6b7280', color.charts.grid)
  }

  const getGridLineWidth = (tickValue) => {
    return getGridLineProperty(tickValue, 'lineWidth', 2, 3, 1)
  }

  const getPointColorFromThreshold = (value, threshold, defaultColor) => {
    if (!threshold || !threshold.colors) return defaultColor
    
    const colorConfig = Object.values(threshold.colors).find(c => 
      parseFloat(value) >= parseFloat(c.min) && parseFloat(value) <= parseFloat(c.max)
    )
    
    return colorConfig ? colorConfig.borderColor : defaultColor
  }

  const getPointBackgroundColorFromThreshold = (value, threshold, defaultColor) => {
    if (!threshold || !threshold.colors) return defaultColor
    
    const colorConfig = Object.values(threshold.colors).find(c => 
      parseFloat(value) >= parseFloat(c.min) && parseFloat(value) <= parseFloat(c.max)
    )
    
    return colorConfig ? colorConfig.backgroundColor : defaultColor
  }

  const datasets = datasetsKeys.map(key => {
    const categoryConfig = color.charts.radarCategories[key] || {}
    const threshold = categoryConfig.threshold

    return {
      label: key,
      data: segments.map(e => e.stats[key]),
      backgroundColor: categoryConfig.background,
      borderColor: categoryConfig.border,
      borderWidth: 2,
      pointBackgroundColor: threshold ? segments.map(e => {
        const value = parseFloat(e.stats[key]) || 0
        return getPointBackgroundColorFromThreshold(value, threshold, categoryConfig.border)
      }) : categoryConfig.border,
      pointBorderColor: segments.map(e => {
        const value = parseFloat(e.stats[key]) || 0
        return getPointColorFromThreshold(value, threshold, categoryConfig.border)
      })
    }
  })

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: segments.map(e => e.label),
      datasets: datasets
    },
    options: {
      scales: {
        r: {
          grid: {
            color: (context) => getGridLineColor(context.tick.value),
            lineWidth: (context) => getGridLineWidth(context.tick.value)
          },
          ticks: {
            color: color.charts.text,
            backdropColor: color.charts.background,
          },
          backgroundColor: color.charts.background,
          pointLabels: {
            display: true,
            font: {
              size: 16
            },
            color: color.charts.text,
            padding: 10
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: color.charts.text,
            borderWidth: 2,
          }
        },
        tooltip: {
          enabled: true
        }
      }
    },
    plugins: [{
      id: 'pointLabels',
      afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx
        ctx.save()
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const categoryConfig = color.charts.radarCategories[dataset.label] || {}
          const showLabels = categoryConfig.showPointLabels || false
          
          if (!showLabels) return
          
          const labelColor = categoryConfig.labelColor || color.charts.text
          const labelBackgroundColor = categoryConfig.labelBackgroundColor || color.charts.background

          const meta = chart.getDatasetMeta(datasetIndex)
          meta.data.forEach((point, pointIndex) => {
            const value = dataset.data[pointIndex]
            if (value === null || value === undefined) return
            
            const angle = point.angle
            const x = point.x + Math.cos(angle) * 25
            const y = point.y + Math.sin(angle) * 25
            
            const formattedValue = typeof value === 'number' ? value.toFixed(1) : value
            
            const metrics = ctx.measureText(formattedValue)
            const width = metrics.width + 10
            const height = 18
            const r = 4
            const rx = x - width / 2
            const ry = y - height / 2

            ctx.fillStyle = labelBackgroundColor
            roundRect(ctx, rx, ry, width, height, r)

            ctx.fillStyle = labelColor
            ctx.fillText(formattedValue, x, y)
          })
        })
        
        ctx.restore()
      }
    }]
  })

  return canvas.toBuffer()
}

module.exports = {
  generateChart,
  getRankImage,
  getElo,
  getKD,
  getChart,
  getGraph,
  getCompareDatasets,
  getEloGain,
  getMapRadarChart
}
