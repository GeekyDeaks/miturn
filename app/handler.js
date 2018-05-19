'use strict'

/**
 * connection handler
 */
const cookie = require('cookie')
const logger = require('winston')
const { lookup } = require('./middleware/session')
const knex = require('./util/knex')



async function getState(group_id, user_id) {

    // get the 
    //await.knex()
}

module.exports = function(io) {

    io.on('connection', async function(socket) {
        logger.debug('connection from %s', socket.id)
        logger.debug('handshake %j', socket.handshake.headers)

        // get the session
        const session_id= socket.handshake.headers['x-miturn-session']
        const group_name = socket.handshake.headers['x-miturn-group']

        logger.debug('looking up session: %s', session_id)
        const session = lookup(session_id)
        if(!session) return socket.emit('nosession')

        logger.debug('looking up group: %s', group_name)
        const group = await knex('group').first().where({ name: group_name })
        if(!group) return socket.emit('nogroup')



        // setup the handler
        socket.on('request', async (req) => {

        })
        socket.on('remove', async (id) => {

        })
        socket.on('accept', async (id) => {

        })

        // send some data
        //const state = await 
        //socket.emit('state', getState(group.id, session.user_id))


    })

}