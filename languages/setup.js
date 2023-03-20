const { languages } = require('../config.json')

const getTranslations = (key) => {
  let languageObject = {}

  languages.forEach(language => {
    languageObject[language] = getTranslation(key, language)
  })

  return languageObject
}

const getTranslation = (key, language) => {
  let languageConf
  try { languageConf = require(`./${language}`) }
  catch (error) { languageConf = require('./en-US') }
  
  let string = languageConf[key]

  if (key.includes('.')) string = key.split('.').reduce((acc, cur) => {
    return acc[cur]
  }, languageConf)

  return string
}

module.exports = {
  getTranslations,
  getTranslation
}