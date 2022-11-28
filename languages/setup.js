const { languages } = require('../config.json')

const getTranslations = (key) => {
  let languageObject = {}

  languages.forEach(language => {
    const string = require(`./${language}`)[key]
    languageObject[language] = string
  })
}

module.exports = {
  getTranslations
}