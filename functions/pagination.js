const Discord = require('discord.js')
const CustomTypeFunc = require('../functions/customType')
const CustomType = require('../templates/customType')

const getPagination = (page, maxPage, id) => {
  /**
   * id: button interaction id
   * page: target page
   * c: current page
   * n: prevent custom id duplication
   */
  return new Discord.MessageActionRow()
    .addComponents([
      CustomTypeFunc.generateButtons(
        { id: id, page: maxPage, c: page, n: 1 },
        CustomType.TYPES.FIRST,
        page === 0),
      CustomTypeFunc.generateButtons(
        { id: id, page: page + 1, c: page, n: 3 },
        CustomType.TYPES.PREV,
        !(page - 1 >= 0)),
      CustomTypeFunc.generateButtons(
        { id: id, page: page - 1, c: page, n: 2 },
        CustomType.TYPES.NEXT,
        !(page + 1 <= maxPage)),
      CustomTypeFunc.generateButtons(
        { id: id, page: 0, c: page, n: 4 },
        CustomType.TYPES.LAST,
        page === maxPage),
    ])
}

module.exports = {
  getPagination
}