'use strict'
const logger = require('winston')

let config
try {
    config = require('../config')
} catch(ex) {
    logger.error('unable to load config: ', ex.message)
    process.exit(1)
}

// logging
logger.remove(logger.transports.Console)
logger.add(logger.transports.Console, { 
    prettyPrint: true, 
    'timestamp': true, 
    level: config.logger || 'info',
    depth: 10,
    handleExceptions: true,
    stderrLevels: ['error']
})

logger.add(logger.transports.File, {
    prettyPrint: true, 
    level: config.logger || 'info',
    depth: 10,
    json: false,
    filename: 'logs/miturn.log',
    handleExceptions: true,
    maxsize: 524288, // 512kB
    maxFiles: 10,
    colorize: false
})


logger.info('Setting up ORM')
const { Model } = require('objection')
const knex = require('knex')(config.db)
Model.knex(knex)

logger.info('App starting')

const DEFAULT_PORT = 3000
const path = require('path')
const Koa = require('koa')
const app = new Koa()
const http = require('http')
const server = http.createServer(app.callback())
const io = require('socket.io')(server)
require('./handler')(io)

const serve = require('koa-static')
const render = require('koa-ejs')
const { promisify } = require('util')

// default error handling
process.on('unhandledRejection', (reason, p) => { 
    logger.error('unhandled rejection: %j', p, reason)
    throw reason 
})

app.on('error', (err) => {
    // if we got here, then we did not handle the error and need to crash
    throw err
})


app.use(serve(path.join(__dirname, 'static')))
const bodyParser = require('koa-bodyparser')
app.use(bodyParser())

logger.info('Installing middleware')
app.use(require('./middleware/logger'))
render(app, {
    root: path.join(__dirname, 'views'),
    layout: false,
    viewExt: 'html',
    cache: false,
    debug: false
})

logger.info('Installing routes')
app.use(require('./routes/api'))
app.use(require('./routes/group'))

logger.info('Start server')
async function init () {
    try {

        logger.info('initialising DB')
        await knex.migrate.latest()
        // to help with unit tests we allow the app to be closed and the DB cleared
        // but this means we need to 
        const listen = promisify(server.listen.bind(server))
        // eslint-disable-next-line eqeqeq, no-eq-null
        const port = config.port != null ? config.port : process.env.PORT || DEFAULT_PORT
        await listen(port)
        logger.info('HTTP Server listening on port %s', port)
        if (process.env.COMPUTERNAME) logger.info('COMPUTERNAME: %s', process.env.COMPUTERNAME)
        if (process.env.WEBSITE_INSTANCE_ID) logger.info('WEBSITE_INSTANCE_ID: %s', process.env.WEBSITE_INSTANCE_ID)
    } catch(ex) {
        logger.error(ex)
        process.exit(1)
    }

}

module.exports = {
    init
}