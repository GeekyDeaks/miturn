'use strict'

/**
 * connection handler
 */

const logger = require('winston')

const Session = require('./models/session')
const Group = require('./models/group')
const Round = require('./models/round')
const Request = require('./models/request')

async function getRecentRequests(group_id, user_id) {
    const recent = await Request.query()
        .select('request').max('request.id as last')
        .innerJoin('round', 'round.id', 'request.round_id')
        .where({ 'request.user_id': user_id, 'round.group_id': group_id })
        .groupBy('request')
        .orderBy('last', 'desc')
    return recent.map( r => r.request )
}

async function getRounds(group_id) {

    const ROUNDS = 3

    // get the 
    //await.knex()
    const rawRounds = await Round.query().where({ group_id})
        .orderBy('id', 'desc').limit(ROUNDS)
        .eager('[requests, requests.user, user]')

    const requestTotal = await Request.query()
        .select('request.user_id').count('request.user_id as total')
        .innerJoin('round', 'round.id', 'request.round_id')
        .where({ 'round.group_id': group_id })
        .whereNotNull('round.user_id')  // only count rounds that have been completed
        .groupBy('request.user_id')

    const roundsTotal = await Round.query()
        .select('user_id').count('user_id as total')
        .where({ group_id })
        .whereNotNull('user_id')
        .groupBy('user_id')

    // build up a map of totals for each user
    const total = {}
    requestTotal.forEach( t => { total[t.user_id] = { requests: t.total, rounds: 0 } } )
    roundsTotal.forEach( t => {
        if(!total[t.user_id]) total[t.user_id] = { requests: 0 }
        total[t.user_id].rounds = t.total 
    })

    const rounds = []
    rawRounds.forEach( rd => {
        const round = {
            user: rd.user ? rd.user.name : null,
            id: rd.id,
            timestamp: rd.updated_at,
            requests: []
        }
        if(rd.requests)
            rd.requests.forEach( rt => {
                const req = {
                    id: rt.id,
                    request: rt.request,
                    user: rt.user.name
                }
                if(!rd.user) {
                    // lookup the user totals
                    if(total[rt.user.id]) {
                        req.requests = total[rt.user.id].requests
                        req.rounds = total[rt.user.id].rounds
                    } else {
                        // no previous history
                        req.requests = req.rounds = 0
                    }
                }
                round.requests.push(req)
            })
        rounds.unshift(round)
    })

    return rounds

}

module.exports = function(io) {

    io.on('connection', async function(socket) {
        logger.debug('connection from %s', socket.id)
        logger.debug('handshake %j', socket.handshake.headers)

        // get the session
        const session_id = socket.handshake.headers['x-miturn-session']
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
        socket.on('request', async () => {

        })
        socket.on('remove', async () => {

        })
        socket.on('accept', async () => {

        })

        // send some initial data
        const rounds = await getRounds(group.id)
        socket.emit('rounds', rounds)
        const recent = await getRecentRequests(group.id, session.user_id)
        socket.emit('recent', recent)
        
    })

}