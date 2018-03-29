require('babel-core/register')
// require('babel-polyfill')
const debug = require('debug')('app:index:')
const xmlparser = require('express-xml-bodyparser')

const seneca = require('seneca')({
  strict: {
    result: false,
  },
})
const plugins = require('./plugins')

const SenecaWeb = require('seneca-web')
const bodyParser = require('body-parser')
const Express = require('express')
const Router = Express.Router
const context = new Router()

const expressAdapter = require('seneca-web-adapter-express')

const senecaWebConfig = {
  context,
  adapter: expressAdapter,
  options: { parseBody: false }, // so we can use body-parser
}

// Start WebServer
new Express()
  .use(bodyParser.json())
  .use(
    xmlparser({
      explicitArray: false,
      normalize: true,
      normalizeTags: true,
      trim: true,
    }),
  )
  .use(context)
  .listen(3000, () => {
    console.log('WebServer Listening on port 3000')
  })

debug('plugins: ', plugins)

seneca.use(SenecaWeb, senecaWebConfig)

Object.keys(plugins).map(key => seneca.use(plugins[key]))

const PORT = process.env.PORT || 5555

seneca.client({ pin: 'role:math' })

// Action Server
seneca.listen(
  {
    // type: 'tcp',
    port: PORT,
  },
  () => {
    console.log('Action server Listening on port', PORT)
  },
)
