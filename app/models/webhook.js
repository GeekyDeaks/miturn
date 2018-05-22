'use strict'

const { Model } = require('objection')
const uuidv4 = require('uuid/v4')

class Webhook extends Model {
    static get tableName() {
        return 'webhook'
    }

    async $beforeInsert(context) {
        await super.$beforeInsert(context)
        if(!this.id) this.id = uuidv4()
    }


    static get relationMappings() {
        // we import here to prevent require loops
        const User = require('./user')
        const Group = require('./group')
        
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'webhook.user_id',
                    to: 'user.id'
                }
            },
            group: {
                relation: Model.HasOneRelation,
                modelClass: Group,
                join: {
                    from: 'webhook.group_id',
                    to: 'group.id'
                }
            }
        }

    }

}
  
module.exports = Webhook