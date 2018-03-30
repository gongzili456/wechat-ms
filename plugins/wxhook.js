import Debug from 'debug'
import config from 'config'
import crypto from 'crypto'
import axios from 'axios'
import moment from 'moment'

const debug = new Debug('app:plugins:message:')

/**
 * 生成签名
 * @param {*} timestamp
 * @param {*} nonce
 * @param {*} token
 */
function getSignature(timestamp, nonce, token) {
  const shasum = crypto.createHash('sha1')
  const arr = [token, timestamp, nonce].sort()
  shasum.update(arr.join(''))

  return shasum.digest('hex')
}

export default function api(options) {
  /**
   * 声明 Web 路由, 供微信 Server 调用
   */
  this.add('init:api', function initApi(msg, respond) {
    this.act(
      'role:web',
      {
        routes: {
          prefix: '/wxserver', // 这个 path 就是路由前缀
          pin: 'role:api,path:*',
          map: {
            wxevent: {
              POST: true,
              GET: true,
            },
          },
        },
      },
      respond,
    )
  })

  /**
   * 微信请求分发
   * http://example.com/wxserver/wxevent
   */
  this.add('role:api,path:wxevent', function door(msg, respond) {
    const method = msg.request$.method
    if (method === 'GET') {
      return this.act(
        {
          role: 'wx',
          cmd: 'wxeventapi_sign',
          args: msg.args,
        },
        respond,
      )
    }

    return this.act(
      {
        role: 'wx',
        cmd: 'wxeventapi',
        args: msg.args,
      },
      respond,
    )
  })

  /**
   * 验证签名
   * 添加域名路径时, 微信 Server 检查可用性使用
   */
  this.add('role:wx,cmd:wxeventapi_sign', function signA(params, respond) {
    const query = params.args.query

    const signature = getSignature(
      query.timestamp,
      query.nonce,
      config.wx.server_token,
    )

    if (signature !== query.signature) {
      return respond('signature error')
    }

    return respond(null, query.echostr)
  })

  /**
   * 这里处理微信转发的消息
   */
  this.add('role:wx,cmd:wxeventapi', function eventApi(params, respond) {
    // parse wechat message
    const body = params.args.body.xml

    /**
     * Handle response rule here
     */
  })
}
