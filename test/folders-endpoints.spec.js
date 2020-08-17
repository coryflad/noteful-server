const app = require('../src/app')
const store = require('../src/store')

describe('Folders Endpoints', () => {
  let foldersCopy
  beforeEach('copy the folders', () => {
    // copy the folders so we can restore them after testing
    foldersCopy = store.folders.slice()
  })

  afterEach('restore the folder', () => {
    // restore the folders back to original
    store.folders = foldersCopy
  })

  describe(`Unauthorized requests`, () => {
    it(`responds with 401 Unauthorized for GET /folders`, () => {
      return supertest(app)
        .get('/folders')
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for POST /folders`, () => {
      return supertest(app)
        .post('/folders')
        .send({ name: 'test-name' })
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for GET /folders/:id`, () => {
      const secondFolder = store.folders[1]
      return supertest(app)
        .get(`/folders/${secondFolder.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })

    it(`responds with 401 Unauthorized for DELETE /folders/:id`, () => {
      const aFolder = store.folders[1]
      return supertest(app)
        .delete(`/folders/${aFolder.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })
  })

  describe('GET /folders', () => {
    it('gets the folders from the store', () => {
      return supertest(app)
        .get('/folders')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, store.folders)
    })
  })

  describe('GET /folders/:id', () => {
    it('gets the folder by ID from the store', () => {
      const secondFolder = store.folders[1]
      return supertest(app)
        .get(`/folders/${secondFolder.id}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, secondFolder)
    })

    it(`returns 404 whe note doesn't exist`, () => {
      return supertest(app)
        .get(`/folders/doesnt-exist`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(404, 'Folder Not Found')
    })
  })

  describe('DELETE /folders/:id', () => {
    it('removes the folder by ID from the store', () => {
      const secondFolder = store.folders[1]
      const expectedFolders = store.folders.filter(s => s.id !== secondFolder.id)
      return supertest(app)
        .delete(`/folders/${secondFolder.id}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(204)
        .then(() => {
          expect(store.folders).to.eql(expectedFolders)
        })
    })

    it(`returns 404 when a note doesn't exist`, () => {
      return supertest(app)
        .delete(`/folders/doesnt-exist`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(404, 'Folder Not Found')
    })
  })
  describe('POST /folders', () => {
    it(`responds with 400 missing 'name' if not supplied`, () => {
      const newFolderMissingName = {
        content: 'test-content'
      }
      return supertest(app)
        .post(`/folders`)
        .send(newFolderMissingName)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, `'name' is required`)
    })

    it('adds a new note to the store', () => {
      const newFolder = {
        name: 'test-name',
      }
      return supertest(app)
        .post(`/folders`)
        .send(newFolder)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newFolder.name)
          // expect(res.body.id).to.be.a('string')
        })
        .then(res => {
          expect(store.folders[store.folders.length - 1]).to.eql(res.body)
        })
    })
  })
})