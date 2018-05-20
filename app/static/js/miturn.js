/* eslint-disable */
function startVue(group, session) {

  return new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      rounds: [],
      recent: []
    },
    created: function() {

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
        that.rounds = JSON.stringify(rounds, null, 4)
      })

      this.io.on('recent', function(recent) {
        that.recent = JSON.stringify(recent, null, 4)
      })
  
  
    }
  })
}
