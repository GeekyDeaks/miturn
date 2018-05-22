'use strict'

const { Model } = require('objection')

const getOrCreateMap = new Map()

class Round extends Model {
    static get tableName() {
        return 'round'
    }

    async $beforeUpdate(context) {
        await super.$beforeUpdate(context)
        this.updated_at = new Date()
    }

    static get relationMappings() {
        // we import here to prevent require loops
        const Request = require('./request')
        const User = require('./user')
        
        return {
            requests: {
                relation: Model.HasManyRelation,
                modelClass: Request,
                join: {
                    from: 'round.id',
                    to: 'request.round_id'
                }
            },
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'round.user_id',
                    to: 'user.id'
                }
            }
        }

    }

    /**
     * Try and create a new active round and 
     * fail if one already exists
     * @param {*} group_id 
     */
    static async getOrCreateActive(group_id) {

        // check if we are already trying to get or create
        // and chain the promise
        if(getOrCreateMap.has(group_id)) return getOrCreateMap.get(group_id)

        async function doit(group_id) {
            // first see if we can find the round
            let round = await Round.query()
                .where({ group_id })
                .whereNull('user_id')
                .first()

            if(round) return round
            // create it

            round = await Round.query().insertAndFetch({ group_id })
            round.created = true
            return round

        }

        const promise = doit(group_id)
        getOrCreateMap.set(group_id, promise)

        const rv = await promise
        getOrCreateMap.delete(group_id)
        return rv

    }

}
  
module.exports = Round