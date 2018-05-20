
function startVue(group, session) {

  return new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      state: {}
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

      this.io.on('state', function(state) {
        that.state = JSON.stringify(state,null,4)
      })
  
  
    }
  })
}
