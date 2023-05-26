const { languages } = require('../config.json')

const getTranslations = (key, replace) => {
  let languageObject = {}

  Object.keys(languages).forEach(language => {
    languageObject[language] = getTranslation(key, language, replace)
  })

  return languageObject
}

const getTranslation = (key, language, replace) => {
  let languageConf
  language = languages[language] || 'en-US'

  try { languageConf = require(`./${language}/translations`) }
  catch (error) { languageConf = require('./en-US/translations') }

  let string = languageConf[key]

  if (key.includes('.')) string = getStrings(key, languageConf)

  if (replace) Object.keys(replace).forEach(key => {
    let value = replace[key].toString()
    if (value?.includes('.')) value = getStrings(value, languageConf)
    string = string.replace(`{${key}}`, value.toLowerCase())
  })

  return string
}

const getStrings = (key, languageConf) => key.split('.').reduce((acc, cur) => acc[cur], languageConf)

module.exports = {
  getTranslations,
  getTranslation
}