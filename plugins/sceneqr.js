/**
 * 带参数的二维码
 */
import Debug from 'debug'
import axios from 'axios'

const debug = new Debug('app:plugins:sceneqr:')

export default function sceneqr(options) {
  this.add('role:wx,cmd:sceneqr', function preQrTicket(params, respond) {
    debug('Get ticket')

    if (params.ticket) return this.prior(params, respond)

    return axios({
      url: 'https://api.weixin.qq.com/cgi-bin/qrcode/create',
      params: { access_token: params.access_token },
      data: {
        expire_seconds: params.expire_seconds || 3600, // 最大30天, 默认一小时
        action_name: params.action_name || 'QR_SCENE',
        // QR_SCENE(临时), QR_LIMIT_SCENE(永久), QR_LIMIT_STR_SCENE(永久字符串)
        action_info: params.action_info,
      },
      method: 'POST',
    })
      .then(resp => {
        debug('ticket -> ', resp.data)

        respond(null, resp.data)
      })
      .catch(respond)
  })

  this.add('role:wx,cmd:sceneqr', function preQrToken(params, respond) {
    debug('Get access_token')

    if (params.access_token) return this.prior(params, respond)
    return this.act(
      {
        role: 'wx',
        cmd: 'access_token',
      },
      (err, token) => {
        if (err) return respond(err)
        params.access_token = token.access_token
        return this.prior(params, respond)
      },
    )
  })
}
