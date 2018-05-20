'use strict'

const { Model } = require('objection')
const uuidv4 = require('uuid/v4')

class Session extends Model {
    static get tableName() {
        return 'session'
    }

    async $beforeInsert(context) {
        await super.$beforeInsert(context)
        if(!this.id) this.id = uuidv4()
    }

    static get relationMappings() {
        // we import here to prevent require loops
        const User = require('./user')
        
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'session.user_id',
                    to: 'user.id'
                }
            }
        }

    }
}
  
module.exports = Session