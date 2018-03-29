import request from 'request'
import Debug from 'debug'

const debug = new Debug('app:plugins:userinfo:')

export default function userinfo(options) {
  this.add('role:wx,cmd:userinfo', (params, respond) => {
    request(
      {
        uri: `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${
          params.access_token
        }&openid=${params.openid}&lang=zh_CN`,
        method: 'GET',
      },
      (e, resp, body) => {
        if (e) return respond(e, null)
        if (typeof body === 'string') {
          body = JSON.parse(body)
        }
        return respond(null, body)
      },
    )
  })

  this.add('role:wx,cmd:userinfo', function two(params, respond) {
    if (params.access_token) {
      return this.prior(params, respond)
    }

    return this.act(
      {
        role: 'wx',
        cmd: 'access_token',
        appid: params.appid,
        secret: params.secret,
      },
      (err, result) => {
        if (err) return respond(err)
        params.access_token = result.access_token
        return this.prior(params, respond)
      },
    )
  })
}
