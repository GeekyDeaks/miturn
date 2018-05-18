'use strict'

const logger = require('winston')
const Router = require('koa-router')
const router = new Router()


router.get('/:group',  async function (ctx) {

    await ctx.cookies.set('miturnsession', 'asessionvalue')
    await ctx.render('group', { text: 'hello!'})

})

module.exports = router.routes()