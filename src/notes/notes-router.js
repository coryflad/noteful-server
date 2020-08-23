const express = require('express')
const uuid = require('uuid/v4')
// const logger = require('../logger')
// const store = require('../store')
const notesService = require('./notes-service')

const notesRouter = express.Router()
// const bodyParser = express.json()
const jsonParser = express.json()

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    notesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes)
      })
      .catch(next)
  })

  .post(jsonParser, (req, res, next) => {
    const {
      name,
      content
    } = req.body
    const newNote = {
      name,
      content
    }

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: {
            message: `Missing '${key}' in request body`
          }
        })

    notesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .json(note)
      })
      .catch(next)
  })

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.note_id))) {
      return res.status(404).json({
        error: {
          message: `Invalid id`
        }
      })
    }
    notesService.getNoteById(
      req.app.get('db'),
      req.params.note_id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: {
              message: `Note doesn't exist`
            }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(res.note)
  })

  .delete((req, res, next) => {
    notesService.deleteNote(
      req.app.get('db'),
      req.params.note_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })



module.exports = notesRouter
