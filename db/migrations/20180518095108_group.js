'use strict'

exports.up = function(knex) {
    return knex.schema.createTable('group', function (t) {
        t.increments('id').primary()
        t.timestamps(true, true)
        t.string('name').notNullable()
    })
}

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('group')
}
