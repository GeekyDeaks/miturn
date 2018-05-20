'use strict'

const { Model } = require('objection')

class User extends Model {
    static get tableName() {
        return 'user'
    }

    static get relationMappings() {
        // we import here to prevent require loops
        const Session = require('./session')
        const Request = require('./request')
        
        return {
            session: {
                relation: Model.HasOneRelation,
                modelClass: Session,
                join: {
                    from: 'user.id',
                    to: 'session.user_id'
                }
            },
            requests: {
                relation: Model.HasManyRelation,
                modelClass: Request,
                join: {
                    from: 'user.id',
                    to: 'request.user_id'
                }
            }
        }

    }
}
  
module.exports = User
