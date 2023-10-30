const InteractionModel = require('./models/interactionModel')
const { Types: { ObjectId } } = require('mongoose')

const create = (jsonData = null) => {
  const newInteraction = new InteractionModel({
    jsonData: jsonData,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return newInteraction.save()
}

const updateOne = (id) => {
  if (!ObjectId.isValid(id)) return
  return InteractionModel.findOneAndUpdate({
    _id: id
  }, {
    updatedAt: new Date(),
  }).exec()
}

const updateOneWithJson = (id, jsonData) => {
  if (!ObjectId.isValid(id)) return
  return InteractionModel.findOneAndUpdate({
    _id: id
  }, {
    jsonData: jsonData,
    updatedAt: new Date(),
  }).exec()
}

const getOne = (id) => {
  if (!ObjectId.isValid(id)) return
  return InteractionModel.findById(id).exec()
}

const deleteOne = (id) => {
  if (!ObjectId.isValid(id)) return
  InteractionModel.deleteOne({ id }).exec()
}

module.exports = {
  create,
  getOne,
  updateOne,
  updateOneWithJson,
  deleteOne
}