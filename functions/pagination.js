const { itemByPage } = require('../config.json')
const { ActionRowBuilder } = require('discord.js')
const { generateButtons, updateButtons } = require('../functions/customType')
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

const getPagination = async (interaction, page, maxPage, id, values) => {
  /**
   * id: button interaction id
   */

  return new ActionRowBuilder()
    .addComponents(await Promise.all([
      generateButtons(
        interaction,
        Object.assign({}, values, { id: id, targetPage: 0, currentPage: page, chartType: values.type }),
        CustomType.TYPES.FIRST,
        disabledOptions(page, maxPage, CustomType.TYPES.FIRST)),
      generateButtons(
        interaction,
        Object.assign({}, values, { id: id, targetPage: page - 1, currentPage: page, chartType: values.type }),
        CustomType.TYPES.PREV,
        disabledOptions(page, maxPage, CustomType.TYPES.PREV)),
      generateButtons(
        interaction,
        Object.assign({}, values, { id: id, targetPage: page + 1, currentPage: page, chartType: values.type }),
        CustomType.TYPES.NEXT,
        disabledOptions(page, maxPage, CustomType.TYPES.NEXT)),
      generateButtons(
        interaction,
        Object.assign({}, values, { id: id, targetPage: maxPage, currentPage: page, chartType: values.type }),
        CustomType.TYPES.LAST,
        disabledOptions(page, maxPage, CustomType.TYPES.LAST))
    ]))
}

const updatePaginationComponents = (components, values, jsonData = null) => {
  updateButtons(components, values.type, jsonData)
  components?.forEach((button) => {
    button.data.disabled = !!disabledOptions(values.currentPage, values.maxPage, CustomType.getTypeFromEmoji(button.data.emoji.name))
  })
}

module.exports = {
  getPagination,
  getPageSlice,
  getMaxPage,
  updatePaginationComponents,
}