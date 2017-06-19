const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const art = fs.readFileSync(path.join(__dirname, 'ascii-art.txt'), 'utf8')

module.exports = {show: () => {
  console.log(chalk.white(art))
}}
