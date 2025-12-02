const { languages } = require('../config.json')

const keyReg = new RegExp(/^[a-zA-Z0-9]+\.[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/i)

const getTranslations = (key, replace) => {
  let languageObject = {}

  Object.keys(languages).forEach(language => {
    languageObject[language] = getTranslation(key, language, replace)
  })

  return languageObject
}

const getStrings = (key, languageConf) => key.split('.').reduce((acc, cur) => acc[cur], languageConf)

const getStringFromConf = (key, languageConf) => keyReg.test(key) ? getStrings(key, languageConf) : languageConf[key]

const getTranslation = (key, language, replace) => {
  let languageConf
  language = languages[language] || 'en-US'
  let string

  try {
    languageConf = require(`./${language}/translations`)
    string = getStringFromConf(key, languageConf)
    if (!string || !string.length) throw new Error('Empty string')
  } catch (error) {
    languageConf = require('./en-US/translations')
    string = getStringFromConf(key, languageConf)
  }

  if (replace) Object.keys(replace).forEach(key => {
    let value = replace[key].toString()
    if (keyReg.test(value)) value = getStrings(value, languageConf)
    string = string.replace(`{${key}}`, value.toLowerCase())
  })

  return string
}

module.exports = {
  getTranslations,
  getTranslation,
  keyReg
}