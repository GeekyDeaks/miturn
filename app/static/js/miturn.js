/* eslint-disable */


Vue.component('round-item',  {
  props: ['round', 'index'],
  template: '#round-item-template',
  data: function() {
    return { requestInput: '' }
  },
  computed: {
    haveActiveRequest: function() {
      var req = this.round.requests.find(function(r) {
        return r.user_id === app.user_id
      })
      return req ? true : false
    },
    showNewRequest: function() {
      // check if we have an active request
      return this.round.active && !this.haveActiveRequest
    },
    showAccept: function() {
      return this.round.active && this.haveActiveRequest
    },
    roundClass: function() {
      //return this.index % 2 ? 'odd-round' : 'even-round'
      return this.round.active ? 'round-active' : 'round-inactive'
    },
    recents: function() {
      return app.recents
    },
    showRecent: function() {
      return app.showRecent
    },
    timestamp: function() {
      var ts = moment.utc(this.round.timestamp)
      //return ts.format('YY-MM-DD HH:MM')
      ts.local()
      return ts.format('ddd MMM D HH:mm')
    },
    visible: function() {
      return this.round.active || this.round.visible
    }
  },
  methods: {
    toggleVisible: function() {
      this.round.visible = !this.round.visible
    },
    toggleRecent: function() {
      app.showRecent = !app.showRecent
    },
    acceptRound: function(round) {
      app.io.emit('accept', round)
    },
    newRequestInput: function(round) {
      // request-input
      console.log('new input request:', this.requestInput, round)
      app.showRecent = false
      app.io.emit('request', this.requestInput, round.id)
    }
  }
})

Vue.component('request-item', {
  props: ['request'],
  template: '#request-item-template',
  computed: {
    deltaClass: function() {
      if(this.request.delta < 0) {
        return 'delta-negative'
      } else if(this.request.delta >= 0) {
        return 'delta-positive'
      } else {
        return 'delta-none'
      }
    },
    isMyRequest: function() {
      return this.request.user_id === app.user_id
    },
    title: function() {
      if(this.request.rounds >= 0 && this.request.requests >= 0) {
        return (this.request.rounds + ' / ' + this.request.requests)
      } else return null
    }
  },
  methods: {
    remove: function(item) {
      console.log('removing: ', item)
      app.io.emit('remove', item.id)
    }
  }
})

Vue.component('recent-item', {
  props: ['recent', 'round'],
  template: '#recent-item-template',
  methods: {
    newRequest: function(item, round) {
      console.log('new request: ', item, round)
      app.showRecent = false
      app.io.emit('request', item, round.id)
    }
  }
})


function startVue(group, session) {

  return new Vue({
    el: '#app',
    data: {
      rounds: [],
      recents: [],
      user_id: null,
      showRecent: false,
      requestInput: null,
      receivedRounds: false,
      error: null
    },
    computed: {
      showNewRound: function() {
        // wait until we have recieved some data, even if it is empty
        if(!this.receivedRounds) return false
        // allow creation if there are no rounds in the group
        if(this.rounds.length === 0) return true
        // see if any of the rounds are not active
        var rd = this.rounds.find( function(r) {
          return r.active
        })
        // show new round if we did not find anything
        return !rd
      }
    },
    methods: {
      newRound: function() {
        app.io.emit('round')
      }
    },
    created: function() {

      var firstShow = true // use this to show the last round

      var that = this
      this.io = io({
        transportOptions: {
          polling: {
            extraHeaders: {
              'x-miturn-session': session,
              'x-miturn-group': group
            }
          }
        }
      })
      this.io.on('connect', function() {
        console.log('socket.io connected')
      })

      this.io.on('rounds', function(rounds) {
        // merge the visibility of the current rounds
        rounds.forEach(function(r) {
          var pr = that.rounds.find( function(e) {
            return e.id === r.id
          })

          r.visible = (pr && pr.visible) ? true : false

        })
        if(firstShow && rounds.length > 0) {
          // show the last one
          rounds[rounds.length - 1].visible = true
        }
        that.rounds = rounds
        that.receivedRounds = true
      })

      this.io.on('recents', function(recents) {
        that.recents = recents
      })

      this.io.on('user', function(user_id) {
        that.user_id = user_id
      })

      this.io.on('nosession', function() {
        that.error = 'Failed to create session'
      })

      this.io.on('nogroup', function() {
        that.error = 'Group does not exist'
      })
  
  
    }
  })
}
