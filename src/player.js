const cp = require('child_process')
const path = require('path')

class Player {
  constructor () {
    this.playScript = path.join(__dirname, 'play.js')
  }

  play (url) {
    if (this.playing) this.stop()
    this.playing = cp.fork(`${this.playScript}`)
    this.playing.send({type: 'url', data: url})

    // Notify when playback finishes.
    this.playing.on('message', params => this.onForkMessage(params))

    return this
  }

  onForkMessage ({type, data}) {
    console.log(`== FORK MESSAGE: ${type}`, data)
    if (type === 'end') {
      if (typeof this.onEndCallback !== 'function') return
      this.onEndCallback()
    }
  }

  onEnd (callback) {
    this.onEndCallback = callback
  }

  playId (id) {
    this.play(`https://youtu.be/${id}`)
    return this
  }

  playObjectId (obj) {
    // TODO
  }

  add (url) {
    // TODO
  }

  stop () {
    if (this.playing) {
      this.playing.kill()
    }

    return this
  }

  next () {
    // TODO
  }

  prev () {
    // TODO
  }
}

module.exports = new Player()
