import Debug from 'debug'
import config from 'config'
import wx_token from 'wechat-access-token'
const debug = new Debug('app:plugins:token:')

export default function token(options) {
  this.add('role:wx,cmd:access_token', (params, respond) => {
    wx_token(params.appid, params.secret, (err, t) => {
      if (err) {
        return respond(err, null)
      }
      return respond(null, t)
    })
  })

  this.add('role:wx,cmd:access_token', function validate(params, respond) {
    params.appid = params.appid || config.wx.appid
    params.secret = params.secret || config.wx.secret

    debug('appid: ', params.appid, 'secret: ', params.secret)
    this.prior(params, respond)
  })
}
