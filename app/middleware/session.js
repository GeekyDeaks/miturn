'use strict'

const config = require('../../config')
const { HTTP_UNAUTHORIZED } = require('../util/const')
const logger = require('winston')

const uuidv4 = require('uuid/v4')
const knex = require('../util/knex')
const { parse } = require('../util/name')

async function createSession(email) {

    let user_id
    // find the user
    const user = await knex('user').first().where({ email })

    if(!user) {
        // create the user
        const name = parse(email)
        user_id = await knex('user').insert({ email, name })
    } else {
        user_id = user.id
    }

    // find the session
    const session = await knex('session').first('id').where({ user_id })

    if(!session) {
        const id = uuidv4()
        await knex('session').insert({ id, user_id })
        return id
    } else {
        return session.id
    }
}

function lookup(id) {
    return knex('session').first().where({ id })
}

async function auth(ctx, next) {

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

module.exports = {
    lookup,
    auth
}