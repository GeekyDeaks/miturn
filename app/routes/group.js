'use strict'

const logger = require('winston')
const Router = require('koa-router')
const router = new Router()

const auth = require('../middleware/auth')


router.get('/:group',  auth, async function (ctx) {

    await ctx.render('group', { 
        text: 'hello!', 
        group: ctx.params.group, 
        session: ctx.session
    })

})

module.exports = router.routes()