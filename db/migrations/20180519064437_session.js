'use strict'

exports.up = function(knex) {
    return knex.schema.createTable('session', function (t) {
        t.string('id').primary()
        t.timestamps(true, true)
        t.integer('user_id').notNullable()
        t.unique(['user_id'])
    })
}

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('session')
}
