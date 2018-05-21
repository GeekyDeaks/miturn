/* eslint-disable */


Vue.component('round-item',  {
  props: ['round', 'index'],
  template: '#round-item-template',
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
      return this.index % 2 ? 'odd-round' : 'even-round'
    },
    recents: function() {
      return app.recents
    }
  },
  methods: {
    toggleVisible: function() {
      this.round.visible = !this.round.visible
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
    }
  }
})

Vue.component('recent-item', {
  props: ['recent'],
  template: '#recent-item-template',
  methods: {
    onClick: function(item) {
      console.log('clicked on: ', item)
    }
  }
})


function startVue(group, session) {

  return new Vue({
    el: '#app',
    data: {
      rounds: [],
      recents: [],
      user_id: null
    },
    computed: {
      showNewRound: function() {
        // see if any of the rounds are not active
        var rd = this.rounds.find( function(r) {
          return r.active
        })
        // show new round if we did not find anything
        return !rd
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
      })

      this.io.on('recents', function(recents) {
        that.recents = recents
      })

      this.io.on('user', function(user_id) {
        that.user_id = user_id
      })
  
  
    }
  })
}
