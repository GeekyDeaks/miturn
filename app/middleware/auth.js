'use strict'

const config = require('../../config')
const { HTTP_UNAUTHORIZED } = require('../util/const')
const logger = require('winston')

const { parse } = require('../util/name')

const Session = require('../models/session')
const User = require('../models/user')

async function createSession(email) {

    let user_id
    // find the user
    let user = await User.query().findOne({ email }).eager('session')

    if(!user) {
        // create the user
        const name = parse(email)
        user = await User.query().insert({ email, name })
    }

    if(!user) throw new Error('unable to find/create user: ' + email)
    // find the session
    if(user.session) return user.session.id

    const session = await Session.query().insert({ user_id: user.id })
    return session.id

}

module.exports = async function auth(ctx, next) {

    let email

    if(config.auth === 'aad') {
        // check if we are authenticated or not
        email = ctx.headers['x-ms-client-principal-name']
        if(!email) {
            return ctx.redirect('/.auth/login/aad?post_login_redirect_url=' + ctx.url)
        } 
    } else if(config.auth === 'dev') {
        email = ctx.query.user
        if(!email) {
            email = 'joe.bloggs@example.com'
        }
    } else {
        ctx.status = HTTP_UNAUTHORIZED
        ctx.body = 'Unauthorised'
        return
    }

    ctx.session = await createSession(email)
    await next()

}