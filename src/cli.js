const inquirer = require('inquirer')
const clear = require('clear')
const chalk = require('chalk')
const yas = require('youtube-audio-server')
const player = require('./player')
const asciiArt = require('./ascii-art')

class Cli {
  constructor () {
    this.questions = {
      default: {
        type: 'input',
        name: 'query',
        message: 'Hi! What do you want to listen to today?'
      }
    }
    this.page = null
  }

  getQuestion (message) {
    if (!message) return false

    return {
      type: 'input',
      name: 'query',
      message
    }
  }

  clear () {
    clear()
    asciiArt.show()
  }

  prompt (message) {
    this.clear()
    const question = this.getQuestion(message)

    inquirer.prompt([question || this.questions.default])
    .then(({query}) => {
      this.clear()
      console.log(`| Searching for ${chalk.cyan(query)}...`)

      yas.search({
        query,
        page: this.page
      },
      (err, response) => {
        if (err) {
          console.error(err)
          this.prompt('An error occurred. Please, try something else:')
          return
        }

        this.buildList(response.items)
      })
    })
    .catch((err) => {
      console.error(err)
    })
  }

  list (choices) {
    this.clear()
    inquirer.prompt([
      {
        type: 'list',
        name: 'song',
        message: `Select a song:`,
        choices: choices
      }
    ])
    .then(({song}) => {
      this.showPlaying(song)
      this.currentSong = song
      this.play(song)
    })
    .catch((err) => {
      console.error(err)
    })
  }

  controls () {
    inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `Controls`,
        choices: [
          {
            name: 'Next',
            value: 'next',
            short: 'Playing next song'
          },
          {
            name: 'Prev',
            value: 'prev',
            short: 'Playing prev song'
          },
          {
            name: 'Stop',
            value: 'stop',
            short: 'Stopped.'
          },
          {
            name: 'Search',
            value: 'search'
          },
          {
            name: 'Back to list',
            value: 'list',
            short: 'Search results'
          }
        ]
      }
    ])
    .then(({action}) => {
      // Back to list.
      if (action === 'list') {
        this.list(this.playlist)
        return
      }

      // Search.
      if (action === 'search') {
        this.prompt()
        return
      }

      // Stop and back to list.
      if (action === 'stop') {
        player[action]()
        this.list(this.playlist)
        return
      }

      // Next
      if (action === 'next') this.next()

      // Prev
      if (action === 'prev') this.prev()
    })
    .catch((err) => {
      console.error(err)
    })
  }

  play (song) {
    this.showPlaying(song)
    player
      .playId(song.id.videoId) // TODO: Support playlists and channels
      .onEnd(() => {
        this.next()
      })

    // Show controls.
    this.controls()
  }

  next () {
    let index = this.currentSong.index + 1
    if (index >= this.playlist.length) index = 0
    this.currentSong = this.playlist[index].value
    this.play(this.currentSong)
  }

  prev () {
    let index = this.currentSong.index - 1
    if (index <= 0) index = this.playlist.length - 1
    this.currentSong = this.playlist[index].value
    this.play(this.currentSong)
  }

  showPlaying (song) {
    this.clear()
    console.log(`
      PLAYING:
      ${chalk.white(chalk.bold(song.snippet.title))}`)

    if (!song.snippet.description) return

    console.log(`
      Description:
      ${chalk.dim(song.snippet.description)}
    `)
  }

  buildList (results) {
    // console.log('RESULTS', results)
    let index = 0
    const choices = results.map((result) => {
      // Add videos only.
      // TODO: Support playlists and channels.
      if (result.id.kind !== 'youtube#video') return false

      result.index = index
      ++index

      return {
        name: result.snippet.title,
        value: result,
        short: `
          ${result.snippet.title}:
          ${result.snippet.description}
        `
      }
    })
    .filter(result => result !== false)

    this.playlist = choices
    this.list(choices)
  }
}

module.exports = new Cli()
