const express = require('express')
const uuid = require('uuid/v4')
// const logger = require('../logger')
// const store = require('../store')
const FolderService = require('./folders-service')

const foldersRouter = express.Router()
// const bodyParser = express.json()
const jsonParser = express.json()

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    FolderService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders)
      })
      .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
    const {
      name
    } = req.body
    const newFolder = {
      name
    }

    for (const [key, value] of Object.entries(newFolder))
      if (value == null)
        return res.status(400).json({
          error: {
            message: `Missing '${key}' in request body`
          }
        })

    FolderService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        res
          .status(201)
          .json(folder)
      })
      .catch(next)
  })

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.folder_id))) {
      return res.status(404).json({
        error: {
          message: `Invalid id`
        }
      })
    }
    FolderService.getFolderById(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: {
              message: `Folder doesn't exist`
            }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(res.folder)
  })

  .delete((req, res, next) => {
    FolderService.deleteFolder(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = foldersRouter
