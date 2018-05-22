'use strict'

exports.up = function(knex) {
    return knex.schema.createTable('webhook', function (t) {
        t.string('id').primary()
        t.timestamps(true, true)
        t.integer('group_id').notNullable()
        t.integer('user_id').notNullable()
        t.string('request').notNullable()
        t.foreign('group_id').references('id').inTable('group')
        t.foreign('user_id').references('id').inTable('user')
        t.index('user_id')
    })
}

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('webhook')
}