'use strict'

/**
 * connection handler
 */
const cookie = require('cookie')
const logger = require('winston')

const Session = require('./models/session')
const Group = require('./models/group')
const Round = require('./models/round')
const Request = require('./models/request')
const { uniqWith } = require('lodash')

async function getState(group_id, user_id) {

    const ROUNDS = 3
    const REQUESTS = 100
    // get the 
    //await.knex()
    const rawRounds = await Round.query().where({ group_id})
                        .orderBy('id', 'desc').limit(ROUNDS)
                        .eager('[requests, requests.user, user]')

    const userRequests = await Request.query()
                        .select('request').max('request.id as last')
                        .innerJoin('round', 'round.id', 'request.round_id')
                        .where({ 'request.user_id': user_id, 'round.group_id': group_id })
                        .groupBy('request')
                        .orderBy('last', 'desc')             


    const rounds = []
    rawRounds.forEach( r => {
        const round = {
            user: r.user ? r.user.name : '',
            timestamp: r.updated_at,
            requests: []
        }
        if(r.requests)
            r.requests.forEach( r => {
                round.requests.push({
                    request: r.request,
                    user: r.user.name
                })
            })
        rounds.unshift(round)
    })

    return {
        rounds,
        userRequests
    }

}

module.exports = function(io) {


    io.on('connection', async function(socket) {
        logger.debug('connection from %s', socket.id)
        logger.debug('handshake %j', socket.handshake.headers)

        // get the session
        const session_id= socket.handshake.headers['x-miturn-session']
        const group_name = socket.handshake.headers['x-miturn-group']

        if(!session_id) return socket.emit('nosession')
        if(!group_name) return socket.emit('nogroup')

        logger.debug('looking up session: %s', session_id)
        const session = await Session.query().findById(session_id).eager('user')
        if(!session) return socket.emit('nosession')

        logger.debug('looking up group: %s', group_name)
        const group = await Group.query().findOne({ name: group_name })
        if(!group) return socket.emit('nogroup')

        // setup the handler
        socket.on('request', async (req) => {

        })
        socket.on('remove', async (id) => {

        })
        socket.on('accept', async (id) => {

        })

        // send some data
        const state = await getState(group.id, session.user_id)
        socket.emit('state', state)


    })

}