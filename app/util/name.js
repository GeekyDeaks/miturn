'use strict'

// parse the name from an email string

function parse(email) {

    // split into
    const re = /^(.+)@.+$/
    const m = re.exec(email)
    if(m) {
        return m[1].replace(/\./g, ' ')
    }
    // was not able to parse
    return(email)
}

module.exports = { parse }