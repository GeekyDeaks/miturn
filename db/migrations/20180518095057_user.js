'use strict'

exports.up = function(knex) {
    return knex.schema.createTable('user', function (t) {
        t.increments('id').primary()
        t.timestamps(true, true)
        t.string('name')
        t.string('email').notNullable()
        t.unique(['email'])
    })
}

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user')
}
