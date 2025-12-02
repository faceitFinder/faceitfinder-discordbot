const { color } = require('../config.json')
const path = require('path')
const Canvas = require('canvas')
const CustomType = require('../templates/customType')
const Chart = require('chart.js/auto')
const { getTranslation } = require('../languages/setup')

const generateChart = (locale, playerName, matchHistory, maxMatch = 20, type = CustomType.TYPES.ELO, game) => {
  const types = type.name.split('-').map(e => CustomType.getType(e.trim()))
  const slicedHistory = matchHistory.slice(0, maxMatch).reverse()
  
  const datas = types.map(type => [type, getGraph(locale, playerName, type, matchHistory, maxMatch).reverse()])
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  const labels = slicedHistory.map(match => dateFormatter.format(new Date(match.date)))

  return getChart(datas, labels, getClassicDatasets, datas.length > 1, game)
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
  const colorConfig = type.color[game] ?? type.color
  
  const colorCache = new Map()
  const defaultColor = Object.values(colorConfig)[0]?.color || '#ffffff'
  
  const pointColors = data.map(value => {
    if (value == null) return null
    if (colorCache.has(value)) return colorCache.get(value)
    const config = colorFilter(colorConfig, value)
    const color = config?.color || defaultColor
    colorCache.set(value, color)
    return color
  })

  return {
    label: type.name,
    data: data,
    fill: i === 0,
    yAxisID: `y${i}`,
    borderColor: (segment) => {
      if (segment.raw == null) return undefined
      return pointColors[segment.dataIndex] || defaultColor
    },
    pointBackgroundColor: (segment) => {
      if (segment.raw == null) return undefined
      return pointColors[segment.dataIndex] || defaultColor
    },
    spanGaps: true,
    segment: {
      borderColor: (segment) => {
        if (segment.p0.skip || segment.p1.skip) return 'rgb(0,0,0,0.2)'
        const prev = segment.p0, current = segment.p1

        ctx.strokeStyle = getGradient(prev, current, ctx, type, game, colorCache)
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

const getGradient = (prev, current, ctx, type, game, colorCache) => {
  const gradient = ctx.createLinearGradient(prev.x, prev.y, current.x, current.y)
  const colorConfig = type.color[game] ?? type.color
  const defaultColor = Object.values(colorConfig)[0]?.color || '#ffffff'
  
  let prevColor, currentColor
  if (colorCache) {
    if (!colorCache.has(prev.raw)) {
      const config = colorFilter(colorConfig, prev.raw)
      prevColor = config?.color || defaultColor
      colorCache.set(prev.raw, prevColor)
    } else {
      prevColor = colorCache.get(prev.raw) || defaultColor
    }
    
    if (!colorCache.has(current.raw)) {
      const config = colorFilter(colorConfig, current.raw)
      currentColor = config?.color || defaultColor
      colorCache.set(current.raw, currentColor)
    } else {
      currentColor = colorCache.get(current.raw) || defaultColor
    }
  } else {
    prevColor = colorFilter(colorConfig, prev.raw)?.color || defaultColor
    currentColor = colorFilter(colorConfig, current.raw)?.color || defaultColor
  }
  
  gradient.addColorStop(0, prevColor)
  gradient.addColorStop(1, currentColor)
  return gradient
}

const colorFilter = (colors, value) => {
  const numValue = parseFloat(value)
  for (const [, config] of Object.entries(colors)) {
    if (numValue >= parseFloat(config.min) && numValue <= parseFloat(config.max)) {
      return config
    }
  }
  return null
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
  const labels = segments.map(e => e.label)

  const categoryConfigs = new Map()
  datasetsKeys.forEach(key => {
    categoryConfigs.set(key, color.charts.radarCategories[key] || {})
  })

  const thresholdLinesMap = new Map()
  const seenThresholdValues = new Set()
  datasetsKeys.forEach(key => {
    const threshold = categoryConfigs.get(key)?.threshold
    if (!threshold) return
    const lines = threshold.lines || (threshold.value ? [{ value: threshold.value, lineWidth: threshold.lineWidth || 2, lineColor: threshold.lineColor || '#6b7280' }] : [])
    lines.forEach(line => {
      if (!seenThresholdValues.has(line.value)) {
        seenThresholdValues.add(line.value)
        thresholdLinesMap.set(line.value, { ...line, thresholdConfig: threshold })
      }
    })
  })

  const customGridLinesMap = new Map()
  const seenGridValues = new Set()
  datasetsKeys.forEach(key => {
    const gridLines = categoryConfigs.get(key)?.gridLines || []
    gridLines.forEach(line => {
      if (!seenGridValues.has(line.value)) {
        seenGridValues.add(line.value)
        customGridLinesMap.set(line.value, line)
      }
    })
  })

  const getGridLineColor = (tickValue) => {
    const customLine = customGridLinesMap.get(tickValue)
    if (customLine) return customLine.color || color.charts.grid
    
    const thresholdLine = thresholdLinesMap.get(tickValue)
    if (thresholdLine) return thresholdLine.lineColor || '#6b7280'
    
    return color.charts.grid
  }

  const getGridLineWidth = (tickValue) => {
    const customLine = customGridLinesMap.get(tickValue)
    if (customLine) return customLine.lineWidth || 2
    
    const thresholdLine = thresholdLinesMap.get(tickValue)
    if (thresholdLine) return thresholdLine.lineWidth || 3
    
    return 1
  }

  const getPointColorsFromThreshold = (value, threshold, defaultColor) => {
    if (!threshold?.colors) return { border: defaultColor, background: defaultColor }
    
    const numValue = parseFloat(value) || 0
    const colorConfig = Object.values(threshold.colors).find(c => 
      numValue >= parseFloat(c.min) && numValue <= parseFloat(c.max)
    )
    
    return colorConfig 
      ? { border: colorConfig.borderColor, background: colorConfig.backgroundColor }
      : { border: defaultColor, background: defaultColor }
  }

  const getRadarGradient = (prev, current, ctx, threshold, defaultColor) => {
    if (!threshold?.colors) {
      const gradient = ctx.createLinearGradient(prev.x, prev.y, current.x, current.y)
      gradient.addColorStop(0, defaultColor)
      gradient.addColorStop(1, defaultColor)
      return gradient
    }

    const prevValue = parseFloat(prev.raw) || 0
    const currentValue = parseFloat(current.raw) || 0
    
    const prevColorConfig = Object.values(threshold.colors).find(c => 
      prevValue >= parseFloat(c.min) && prevValue <= parseFloat(c.max)
    )
    const currentColorConfig = Object.values(threshold.colors).find(c => 
      currentValue >= parseFloat(c.min) && currentValue <= parseFloat(c.max)
    )

    const prevColor = prevColorConfig?.borderColor || defaultColor
    const currentColor = currentColorConfig?.borderColor || defaultColor

    const gradient = ctx.createLinearGradient(prev.x, prev.y, current.x, current.y)
    gradient.addColorStop(0, prevColor)
    gradient.addColorStop(1, currentColor)
    return gradient
  }

  const datasets = datasetsKeys.map(key => {
    const categoryConfig = categoryConfigs.get(key)
    const threshold = categoryConfig.threshold
    const defaultColor = categoryConfig.border

    if (!threshold) {
      return {
        label: key,
        data: segments.map(e => e.stats[key]),
        backgroundColor: categoryConfig.background,
        borderColor: defaultColor,
        borderWidth: 2,
        pointBackgroundColor: defaultColor,
        pointBorderColor: defaultColor
      }
    }

    const pointColors = segments.map(e => {
      const value = parseFloat(e.stats[key]) || 0
      return getPointColorsFromThreshold(value, threshold, defaultColor)
    })

    return {
      label: key,
      data: segments.map(e => e.stats[key]),
      backgroundColor: categoryConfig.background,
      borderColor: 'transparent',
      borderWidth: 2,
      pointBackgroundColor: pointColors.map(c => c.background),
      pointBorderColor: pointColors.map(c => c.border)
    }
  })

  const labelConfigs = new Map()
  datasetsKeys.forEach(key => {
    const config = categoryConfigs.get(key)
    if (config?.showPointLabels) {
      labelConfigs.set(key, {
        labelColor: config.labelColor || color.charts.text,
        labelBackgroundColor: config.labelBackgroundColor || color.charts.background,
        threshold: config.threshold,
        defaultColor: config.border
      })
    }
  })

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets
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
      id: 'radarGradient',
      afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx
        ctx.save()
        
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const categoryConfig = categoryConfigs.get(dataset.label)
          const threshold = categoryConfig?.threshold
          if (!threshold?.colors) return
          
          const defaultColor = categoryConfig.border
          const meta = chart.getDatasetMeta(datasetIndex)
          
          for (let i = 0; i < meta.data.length; i++) {
            const current = meta.data[i]
            const next = meta.data[(i + 1) % meta.data.length]
            
            const prevValue = parseFloat(dataset.data[i]) || 0
            const nextValue = parseFloat(dataset.data[(i + 1) % dataset.data.length]) || 0
            
            const prevColorConfig = Object.values(threshold.colors).find(c => 
              prevValue >= parseFloat(c.min) && prevValue <= parseFloat(c.max)
            )
            const nextColorConfig = Object.values(threshold.colors).find(c => 
              nextValue >= parseFloat(c.min) && nextValue <= parseFloat(c.max)
            )

            const prevColor = prevColorConfig?.borderColor || defaultColor
            const nextColor = nextColorConfig?.borderColor || defaultColor

            const gradient = ctx.createLinearGradient(current.x, current.y, next.x, next.y)
            gradient.addColorStop(0, prevColor)
            gradient.addColorStop(1, nextColor)
            
            ctx.strokeStyle = gradient
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(current.x, current.y)
            ctx.lineTo(next.x, next.y)
            ctx.stroke()
          }
        })
        
        ctx.restore()
      }
    }, {
      id: 'pointLabels',
      afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx
        ctx.save()
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const labelConfig = labelConfigs.get(dataset.label)
          if (!labelConfig) return

          const { labelColor, labelBackgroundColor, threshold, defaultColor } = labelConfig
          const meta = chart.getDatasetMeta(datasetIndex)
          
          meta.data.forEach((point, pointIndex) => {
            const value = dataset.data[pointIndex]
            if (value == null) return
            
            let pointLabelColor = labelColor
            if (threshold?.colors) {
              const numValue = parseFloat(value) || 0
              const colorConfig = Object.values(threshold.colors).find(c => 
                numValue >= parseFloat(c.min) && numValue <= parseFloat(c.max)
              )
              pointLabelColor = colorConfig?.borderColor || defaultColor || labelColor
            }
            
            const angle = point.angle
            const x = point.x + Math.cos(angle) * 25
            const y = point.y + Math.sin(angle) * 25
            
            const formattedValue = typeof value === 'number' ? value.toFixed(1) : String(value)
            const metrics = ctx.measureText(formattedValue)
            const width = metrics.width + 10
            const rx = x - width / 2
            const ry = y - 9

            ctx.fillStyle = labelBackgroundColor
            roundRect(ctx, rx, ry, width, 18, 4)

            ctx.fillStyle = pointLabelColor
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
