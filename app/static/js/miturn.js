
function startVue(group, session) {

  return new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!'
    },
    created: function() {

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
  
  
    }
  })
}
