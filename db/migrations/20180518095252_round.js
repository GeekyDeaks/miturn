'use strict'

exports.up = function(knex) {
    return knex.schema.createTable('round', function (t) {
        t.increments('id').primary()
        t.timestamps(true, true)
        t.integer('group_id').notNullable()
        t.integer('user_id') // who claimed the round
        t.foreign('group_id').references('id').inTable('group')
        t.foreign('user_id').references('id').inTable('user')
        t.index(['group_id'])
    })
}

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('round')
}