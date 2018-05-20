'use strict'

const logger = require('winston')
const Router = require('koa-router')
const router = new Router()

router.get('/api/:key', async function (ctx) {

    ctx.body = ctx.params.key

})

module.exports = router.routes()