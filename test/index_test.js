const assert = require('assert')
const IIIFCommonsPlugin = require('../src/plugin.js')

describe('IIIF Commons Plugin', () => {
  it('exists', () => {
    assert.equal(typeof IIIFCommonsPlugin, 'function')
  })

  it('responds to import hook', () => {
    assert.equal(typeof (new IIIFCommonsPlugin).import, 'function')
  })
})
