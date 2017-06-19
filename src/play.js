const Speaker = require('speaker')
const lame = require('lame')
const stream = require('youtube-audio-stream')

process.on('message', ({type, data}) => {
  if (type === 'url') {
    play(data)
  }
})

function play (url) {
  const speaker = new Speaker()
  if (!url.match(/^https?:\/\/[www]*.?[youtube.com|youtu.be].*/)) {
    console.log('ERROR: Invalid URL:', url)
    process.exit()
  }

  speaker.on('flush', (err, data) => {
    process.send({type: 'end', data: data || err}, () => {
      process.exit()
    })
  })

  stream(url)
    .pipe(new lame.Decoder())
    .pipe(speaker)
}
