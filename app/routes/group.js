'use strict'

const logger = require('winston')
const Router = require('koa-router')
const router = new Router()

const { auth } = require('../middleware/session')


router.get('/:group',  auth, async function (ctx) {

    await ctx.cookies.set('miturnsession', ctx.session)
    await ctx.render('group', { text: 'hello!'})

})

module.exports = router.routes()