const InteractionModel = require('./models/interactionModel')

const create = (jsonData = null) => {
  const newInteraction = new InteractionModel({
    jsonData: jsonData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return newInteraction.save()
}

const updateOne = (id) => InteractionModel.updateOne({
  _id: id
}, {
  updatedAt: new Date(),
}).exec()

const getOne = (_id) => InteractionModel.findById(_id).exec()

module.exports = {
  create,
  getOne,
  updateOne,
}