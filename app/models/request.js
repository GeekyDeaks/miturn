'use strict'

const { Model } = require('objection')

class Request extends Model {
    static get tableName() {
        return 'request'
    }

    static get relationMappings() {
        // we import here to prevent require loops
        const User = require('./user')
        const Round = require('./round')
        
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'request.user_id',
                    to: 'user.id'
                }
            },
            round: {
                relation: Model.HasOneRelation,
                modelClass: Round,
                join: {
                    from: 'request.round_id',
                    to: 'round.id'
                }
            }
        }

    }

}
  
module.exports = Request