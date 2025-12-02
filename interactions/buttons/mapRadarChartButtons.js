const CommandsStats = require('../../database/commandsStats')
const { buildDefaultMapEmbed } = require('../../commands/map')
const { getCardByUserType } = require('../../templates/loadingCard')
const { TYPES } = require('../../templates/customType')
const Discord = require('discord.js')
const Interaction = require('../../database/interaction')

/**
 * Update map radar chart.
 */
module.exports = {
  name: 'mapRadarChartButtons',
  async execute(interaction, json, newUser = false) {
    CommandsStats.create('map', `button - ${json.type.name}`, interaction)
    
    getCardByUserType(newUser, interaction)

    if (newUser) {
      return buildDefaultMapEmbed(interaction, json.playerId, json.game, json.mode)
    }

    let types = json.types || [
      TYPES.MATCHES,
      TYPES.WINS,
      {
        ...TYPES.ELO_GAIN,
        style: Discord.ButtonStyle.Secondary
      }
    ]

    const typeRelations = {
      [TYPES.ELO_GAIN.name]: [TYPES.WINS.name, TYPES.MATCHES.name],
      [TYPES.WINS.name]: [TYPES.ELO_GAIN.name],
      [TYPES.MATCHES.name]: [TYPES.ELO_GAIN.name],
    }

    const clickedTypeName = json.type.name
    const typesToDisable = typeRelations[clickedTypeName] || []
    
    const activeCountBefore = types.filter(t => t.style === Discord.ButtonStyle.Success).length
    const clickedType = types.find(t => t.name === clickedTypeName)
    const isCurrentlyActive = clickedType?.style === Discord.ButtonStyle.Success

    types = types.map(t => {
      if (t.name === clickedTypeName) {
        if (activeCountBefore === 1 && isCurrentlyActive) {
          return t
        }
        return {
          ...TYPES[t.name] || t,
          style: isCurrentlyActive ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Success
        }
      }
      if (!isCurrentlyActive && typesToDisable.includes(t.name)) {
        return {
          ...TYPES[t.name] || t,
          style: Discord.ButtonStyle.Secondary
        }
      }
      return t
    })
    
    const activeCountAfter = types.filter(t => t.style === Discord.ButtonStyle.Success).length
    if (activeCountAfter === 0) {
      types = types.map(t => {
        if (t.name === clickedTypeName) {
          return {
            ...TYPES[t.name] || t,
            style: Discord.ButtonStyle.Success
          }
        }
        return t
      })
    }

    const activeTypes = types.filter(t => t.style === Discord.ButtonStyle.Success)
    const lastActiveType = activeTypes.length === 1 ? activeTypes[0] : null

    const resp = await buildDefaultMapEmbed(interaction, json.playerId, json.game, json.mode, types, lastActiveType)

    const selectMapRow = interaction.message.components.at(0)

    const buttonRow = interaction.message.components.find(row => 
      row.components.some(btn => btn.customId === interaction.customId)
    )
    
    if (buttonRow) {
      buttonRow.components.forEach(btn => Interaction.deleteOne(btn.customId))
    }

    if (selectMapRow) {
      selectMapRow.components.at(0).data.disabled = false
      resp.components = [
        selectMapRow,
        ...resp.components
      ]
    }

    return resp
  }
}
