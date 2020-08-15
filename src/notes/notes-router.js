const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const store = require('../store')

const notesRouter = express.Router()
const bodyParser = express.json()

notesRouter
  .route('/notes')
  .get((req, res) => {
    res.json(store.notes)
  })
  .post(bodyParser, (req, res) => {
    for (const field of ['name', 'content']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`'${field}' is required`)
      }
    }
    const { name, content } = req.body

    const note = { id: uuid(), name, content }

    store.notes.push(note)

    logger.info(`Note with id ${note.id} created`)
    res
      .status(201)
      .location(`http://localhost:8000/notes/${note.id}`)
      .json(note)
  })


notesRouter
  .route('/notes/:note_id')
  .get((req, res) => {
    const { note_id } = req.params

    const note = store.notes.find(n => n.id == note_id)

    if (!note) {
      logger.error(`Note with id ${note_id} not found.`)
      return res
        .status(404)
        .send('Note Not Found')
    }

    res.json(note)
  })
  .delete((req, res) => {
    const { note_id } = req.params

    const noteIndex = store.notes.findIndex(b => b.id === note_id)

    if (noteIndex === -1) {
      logger.error(`Note with id ${note_id} not found.`)
      return res
        .status(404)
        .send('Note Not Found')
    }

    store.notes.splice(noteIndex, 1)

    logger.info(`Note with id ${note_id} deleted.`)
    res
      .status(204)
      .end()
  })

module.exports = notesRouter
