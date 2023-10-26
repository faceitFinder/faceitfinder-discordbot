const { itemByPage } = require('../config.json')
const { ActionRowBuilder } = require('discord.js')
const { generateButtons } = require('../functions/customType')
const CustomType = require('../templates/customType')

const disabledOptions = (page, maxPage, type) => {
  switch (type) {
  case CustomType.TYPES.FIRST:
    return page === 0 ? type : null
  case CustomType.TYPES.PREV:
    return !(page - 1 >= 0) ? type : null
  case CustomType.TYPES.NEXT:
    return !(page + 1 <= maxPage) ? type : null
  case CustomType.TYPES.LAST:
    return page === maxPage ? type : null
  default:
    return null
  }
}

const getPageSlice = (page, items = itemByPage) => {
  return {
    start: page * items,
    end: (page + 1) * items
  }
}

const getMaxPage = (array, items = itemByPage) => {
  return Math.floor(array.length / items) - !(array.length % items >= 1)
}

const getPagination = async (interaction, page, maxPage, id) => {
  /**
   * id: button interaction id
   * tp: target page
   * cp: current page
   */

  return new ActionRowBuilder()
    .addComponents(await Promise.all([
      generateButtons(
        interaction,
        { id: id, tp: 0, cp: page },
        CustomType.TYPES.FIRST,
        disabledOptions(page, maxPage, CustomType.TYPES.FIRST)),
      generateButtons(
        interaction,
        { id: id, tp: page - 1, cp: page },
        CustomType.TYPES.PREV,
        disabledOptions(page, maxPage, CustomType.TYPES.PREV)),
      generateButtons(
        interaction,
        { id: id, tp: page + 1, cp: page },
        CustomType.TYPES.NEXT,
        disabledOptions(page, maxPage, CustomType.TYPES.NEXT)),
      generateButtons(
        interaction,
        { id: id, tp: maxPage, cp: page },
        CustomType.TYPES.LAST,
        disabledOptions(page, maxPage, CustomType.TYPES.LAST))
    ]))
}

module.exports = {
  getPagination,
  getPageSlice,
  getMaxPage,
  disabledOptions
}