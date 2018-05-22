'use strict'

const Router = require('koa-router')
const router = new Router()
const logger = require('winston')
const { HTTP_CREATED, HTTP_CONFLICT } = require('../util/const')

const Webhook = require('../models/webhook')
const Round = require('../models/round')
const Request = require('../models/request')
const handler = require('../handler')

router.post('/webhook/:key', async function (ctx) {

    ctx.body = ctx.params.key

    const hook = await Webhook.query().findById(ctx.params.key).eager('group')

    if(!hook || !hook.group) return
    const { group_id, user_id, request } = hook

    // the round get/create should not fail
    const round = await Round.getOrCreateActive(group_id)

    // but creating the request may if we already have a request
    try {
        await Request.query().insertAndFetch({
            round_id: round.id,
            user_id,
            request
        })
        handler.broadcastUpdate(group_id)
        ctx.status = HTTP_CREATED
    } catch(ex) {
        logger.error('failed to create webook request: %j', hook, ex)
        ctx.status = HTTP_CONFLICT
    }

})

module.exports = router.routes()