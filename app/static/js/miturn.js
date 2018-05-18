var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  created: function() {


    this.io = io()
    this.io.on('connect', function() {
      console.log('socket.io connected')
    })


  }
})