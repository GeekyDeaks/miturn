'use strict'

const Router = require('koa-router')
const router = new Router()

router.get('/api/:key', function (ctx) {

    ctx.body = ctx.params.key

})

module.exports = router.routes()