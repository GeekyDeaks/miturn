'use strict'

const { Model } = require('objection')

class Round extends Model {
    static get tableName() {
        return 'round'
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

}
  
module.exports = Round