'use strict'

exports.seed = async function(knex) {

    await knex('user').insert([{
        name: 'Andi',
        email: 'andi@bloggs.nul'
    },{
        name: 'Inara',
        email: 'inara@bloggs.nul'
    }, {
        name: 'Joe',
        email: 'joe@bloggs.nul'
    }])

    await knex('group').insert([{
        name: 'koffee'
    }, {
        name: 'vendor'
    }])

    await knex('round').insert([{
        group_id: 1,
        user_id: 2
    },{
        group_id: 1,
        user_id: 1
    },{
        group_id: 1
    },{
        group_id: 2,
        user_id: 3
    },{ 
        group_id: 2,
        user_id: 2
    }])

    await knex('request').insert([{
        user_id: 1,
        round_id: 1,
        request: 'Skinny Latte'
    }, {
        user_id: 2,
        round_id: 1,
        request: 'Latte'
    }, {
        user_id: 3,
        round_id: 1,
        request: 'Americano'
    },{
        user_id: 1,
        round_id: 2,
        request: 'Skinny Latte'
    }, {
        user_id: 2,
        round_id: 2,
        request: 'Flat White'
    }, {
        user_id: 1,
        round_id: 3,
        request: 'Skinny Latte'
    }, {
        user_id: 3,
        round_id: 3,
        request: 'Americano'
    }, {
        user_id: 1,
        round_id: 4,
        request: '018'
    }, {
        user_id: 2,
        round_id: 4,
        request: 'water'
    }, {
        user_id:3,
        round_id: 4,
        request: '314'
    }, {
        user_id: 1,
        round_id: 5,
        request: '018'
    }, {
        user_id: 2,
        round_id: 5,
        request: 'water'
    }])

}