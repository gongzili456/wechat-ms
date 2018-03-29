import request from 'request'
import JsSHA from 'jssha'
import config from 'config'
import Debug from 'debug'
import signRawText from '../lib/signRawText'

const debug = new Debug('app:plugins:sign:')
let jsapi_ticket = null

const createNonceStr = () => {
  return Math.random()
    .toString(36)
    .substr(2, 15)
}

function createTimestamp() {
  return parseInt(Date.now() / 1000) + ''
}

function ticket_expired() {
  return jsapi_ticket && jsapi_ticket.expires_in - 10000 > Date.now()
}

export default function sign(options) {
  this.add('role:wx,cmd:sign', function cb(params, respond) {
    const ret = {
      jsapi_ticket: params.jsapi_ticket,
      nonceStr: createNonceStr(),
      timestamp: createTimestamp(),
    }

    if (params.url) {
      ret.url = params.url
    }

    const string = signRawText(ret)
    const shaObj = new JsSHA('SHA-1', 'TEXT')
    shaObj.update(string)
    ret.signature = shaObj.getHash('HEX')

    return respond(null, ret)
  })

  this.add('role:wx,cmd:sign', function cb(params, respond) {
    if (!ticket_expired) {
      params.jsapi_ticket = jsapi_ticket.ticket
      return this.prior(params, respond)
    }

    return request(
      {
        uri: `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${
          params.access_token
        }&type=jsapi`,
        method: 'GET',
      },
      (e, resp, body) => {
        if (e) return respond(e, null)
        if (typeof body === 'string') {
          body = JSON.parse(body)
        }

        jsapi_ticket = {
          ticket: body.ticket,
          expires_in: Date.now() + 7200 * 1000,
        }
        params.jsapi_ticket = body.ticket
        return this.prior(params, respond)
      },
    )
  })

  this.add('role:wx,cmd:sign', function cb(params, respond) {
    return this.act(
      {
        role: 'wx',
        cmd: 'access_token',
        appid: config.appid,
        secret: config.secret,
      },
      (err, result) => {
        if (err) return respond(err)
        params.access_token = result.access_token
        return this.prior(params, respond)
      },
    )
  })
}
