const { itemByPage } = require('../config.json')
const { ActionRowBuilder } = require('discord.js')
const { generateButtons } = require('../functions/customType')
const CustomType = require('../templates/customType')

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
   * page: target page
   * c: current page
   */

  return new ActionRowBuilder()
    .addComponents(await Promise.all([
      generateButtons(
        interaction,
        { id: id, page: 0, c: page },
        CustomType.TYPES.FIRST,
        page === 0 ? CustomType.TYPES.FIRST : null),
      generateButtons(
        interaction,
        { id: id, page: page - 1, c: page },
        CustomType.TYPES.PREV,
        !(page - 1 >= 0) ? CustomType.TYPES.PREV : null),
      generateButtons(
        interaction,
        { id: id, page: page + 1, c: page },
        CustomType.TYPES.NEXT,
        !(page + 1 <= maxPage) ? CustomType.TYPES.NEXT : null),
      generateButtons(
        interaction,
        { id: id, page: maxPage, c: page },
        CustomType.TYPES.LAST,
        page === maxPage ? CustomType.TYPES.LAST : null)
    ]))
}

module.exports = {
  getPagination,
  getPageSlice,
  getMaxPage
}