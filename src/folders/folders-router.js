const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const store = require('../store')

const foldersRouter = express.Router()
const bodyParser = express.json()

foldersRouter
  .route('/folders')
  .get((req, res) => {
    res.json(store.folders)
  })
  .post(bodyParser, (req, res) => {
    for (const field of ['name']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`'${field}' is required`)
      }
    }
    const { name } = req.body

    if (!name) {
      logger.error(`Name is required`)
      return res
        .status(400)
        .send('Invalid Data')
    }

    const folder = { id: uuid(), name }

    store.folders.push(folder)

    logger.info(`Folder with id ${folder.id} created`)
    res
      .status(201)
      .location(`http://localhost:8000/folders/${folder.id}`)
      .json(folder)
  })

foldersRouter
  .route('/folders/:folder_id')
  .get((req, res) => {
    const { folder_id } = req.params

    const folder = store.folders.find(f => f.id == folder_id)

    if (!folder) {
      logger.error(`Folder with id ${folder_id} not found.`)
      return res
        .status(404)
        .send('Folder Not Found')
    }

    res.json(folder)
  })

  .delete((req, res) => {
    const { folder_id } = req.params

    const folderIndex = store.folders.findIndex(f => f.id === folder_id)

    if (folderIndex === -1) {
      logger.error(`Folder with id ${folder_id} not found.`)
      return res
        .status(404)
        .send('Folder Not Found')
    }

    store.folders.splice(folderIndex, 1)

    logger.info(`Folder with id ${folder_id} deleted.`)
    res
      .status(204)
      .end()
  })

module.exports = foldersRouter
