'use strict'

exports.up = function(knex) {
    return knex.schema.createTable('request', function (t) {
        t.increments('id').primary()
        t.timestamps(true, true)
        t.integer('round_id').notNullable()
        t.integer('user_id').notNullable()
        t.string('request').notNullable()
        t.foreign('round_id').references('id').inTable('round')
        t.foreign('user_id').references('id').inTable('user')
        t.unique(['round_id', 'user_id'])
    })
}

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('request')
}