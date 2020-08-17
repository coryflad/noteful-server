const app = require('../src/app')
const store = require('../src/store')

describe('Notes Endpoints', () => {
  let notesCopy
  beforeEach('copy the notes', () => {
    // copy the notes so we can restore them after testing
    notesCopy = store.notes.slice()
  })

  afterEach('restore the notes', () => {
    // restore the notes back to original
    store.notes = notesCopy
  })

  describe(`Unauthorized requests`, () => {
    it(`responds with 401 Unauthorized for GET /notes`, () => {
      return supertest(app)
        .get('/notes')
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for POST /notes`, () => {
      return supertest(app)
        .post('/notes')
        .send({ name: 'test-name', content: 'test-content' })
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for GET /notes/:id`, () => {
      const secondNote = store.notes[1]
      return supertest(app)
        .get(`/notes/${secondNote.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })

      it(`responds with 401 Unauthorized for DELETE /notes/:id`, () => {
        const aNote = store.notes[1]
        return supertest(app)
          .delete(`/bookmarks/${aNote.id}`)
          .expect(401, { error: 'Unauthorized request' })
      })
    })

    describe('GET /notes', () => {
      it('gets the notes from the store', () => {
        return supertest(app)
          .get('/notes')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, store.notes)
      })
    })

    describe('GET /notes/:id', () => {
      it('gets the note by ID from the store', () => {
        const secondNote = store.notes[1]
        return supertest(app)
          .get(`/notes/${secondNote.id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, secondNote)
      })

      it(`returns 404 whe note doesn't exist`, () => {
        return supertest(app)
          .get(`/notes/doesnt-exist`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, 'Note Not Found')
      })
    })

    describe('DELETE /notes/:id', () => {
      it('removes the note by ID from the store', () => {
        const secondNote = store.notes[1]
        const expectedNotes = store.notes.filter(s => s.id !== secondNote.id)
        return supertest(app)
          .delete(`/notes/${secondNote.id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(() => {
            expect(store.notes).to.eql(expectedNotes)
          })
      })

      it(`returns 404 when a note doesn't exist`, () => {
        return supertest(app)
          .delete(`/notes/doesnt-exist`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, 'Note Not Found')
      })
    })

    describe('POST /notes', () => {
      it(`responds with 400 missing 'name' if not supplied`, () => {
        const newNoteMissingName = {
          content: 'test-content'
        }
        return supertest(app)
          .post(`/notes`)
          .send(newNoteMissingName)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(400, `'name' is required`)
      })

      it('adds a new note to the store', () => {
        const newNote = {
          name: 'test-name',
          content: 'test-content'
        }
        return supertest(app)
          .post(`/notes`)
          .send(newNote)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(201)
          .expect(res => {
            expect(res.body.name).to.eql(newNote.name)
            expect(res.body.content).to.eql(newNote.content)
            // expect(res.body.id).to.be.a('string')
          })
          .then(res => {
            expect(store.notes[store.notes.length - 1]).to.eql(res.body)
          })
      })
    })
  })
