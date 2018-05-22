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

    const ROUNDS = 5

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

    const roundsTotal =  await Round.query()
        .select('round.user_id').count('round.user_id as total')
        .innerJoin('request', 'round.id', 'request.round_id')
        .where({ 'round.group_id': group_id })
        .andWhere('request.user_id', '!=', 'round.user_id')
        .whereNotNull('round.user_id')  // only count rounds that have been completed
        .groupBy('round.user_id')

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
            active: rd.user ? false : true,
            requests: []
        }
        if(rd.requests)
            rd.requests.forEach( rt => {
                const req = {
                    id: rt.id,
                    request: rt.request,
                    user: rt.user.name,
                    active: round.active
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
                    req.delta = req.rounds - req.requests
                    req.user_id = rt.user.id
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
        const user_id = session.user.id

        logger.debug('looking up group: %s', group_name)
        const group = await Group.query().findOne({ name: group_name })
        if(!group) return socket.emit('nogroup')

        async function broadcastUpdate() {
            const rounds = await getRounds(group.id)
            io.to(group.name).emit('rounds', rounds)
        }

        // setup the handler
        socket.on('request', async (request, round_id) => {
            logger.info('new request from user %s: %s, round: %s', user_id, request, round_id)
            // should we check there is an active 
            try {
                const req = await Request.query().insertAndFetch({
                    request,
                    user_id,
                    round_id
                })
    
                logger.debug('created request %j', req)
                if(req) {
                    broadcastUpdate()
                    // update the recents
                    const recents = await getRecentRequests(group.id, user_id)
                    socket.emit('recents', recents)
                }
            } catch(ex) {
                logger.error('failed to create new request:', ex)
            }

        })
        socket.on('remove', async (id) => {
            logger.info('remove request from user %s: %s', user_id, id)
            try {
                const req = await Request.query().delete()
                    .where('id', id)

                logger.debug('removed %s request(s)', req)
                if(req) broadcastUpdate()
            } catch(ex) {
                logger.error('failed to remove request %s:', id, ex)
            }
        })

        socket.on('round', async () => {
            logger.info('new round request from user %s', user_id)
            // try and create a new round with an
            // id one more that the largest id of
            // all rounds not in this group or
            // that are inactive in this group
            try {
                const round = await Round.query()
                    .max('id as max')
                    .where('group_id', '!=', group.id)
                    .orWhere( (builder) => {
                        builder.where('group_id', group.id).whereNotNull('user_id')
                    })

                if(round.length && round[0].max) {
                    // do something
                    const newRound = await Round.query()
                        .insert({ id: round[0].max + 1, group_id: group.id })

                    logger.debug('created round: %j', newRound)
                    if(newRound) broadcastUpdate()
                }
            } catch(ex) {
                logger.error('failed to create new round:', ex)
            }

        })

        socket.on('accept', async (round) => {
            logger.info('accept round from user %s: %j', user_id, round)
            try {
                const rd = await Round.query()
                    .update({ user_id })
                    .where({ id: round.id})
                    .whereNull('user_id')
                logger.debug('accepted %s round(s)', rd)
                if(rd) broadcastUpdate()
            } catch(ex) {
                logger.error('failed to accept round', ex)
            }

        })

        // send some initial data
        socket.emit('user', user_id)

        const recents = await getRecentRequests(group.id, user_id)
        socket.emit('recents', recents)

        // join the group broadcast
        socket.join(group.name)

        const rounds = await getRounds(group.id)
        socket.emit('rounds', rounds)


        
    })

}