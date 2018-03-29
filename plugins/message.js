import Debug from 'debug'
import config from 'config'
import axios from 'axios'
import WechatApi from 'wechat-api'

const debug = new Debug('app:plugins:message:')

export default function message(options) {
	const api = new WechatApi(config.wx.appid, config.wx.secret, (cb) => {
		this.act({
			role: 'wx',
			cmd: 'access_token',
		}, (err, token) => {
			if (err) return cb(err)
			return cb(null, {
				accessToken: token.access_token,
				expireTime: new Date(token.expires_in),
			})
		})
	})

	this.add('role:wx,cmd:message,type:text', function text(params, respond) {
		api.sendText(params.openid, params.text, respond)
	})

	/** var articles = [
	 *  {
	 *    "title":"Happy Day",
	 *    "description":"Is Really A Happy Day",
	 *    "url":"URL",
	 *    "picurl":"PIC_URL"
	 *  },
	 *  {
	 *    "title":"Happy Day",
	 *    "description":"Is Really A Happy Day",
	 *    "url":"URL",
	 *    "picurl":"PIC_URL"
	 *  }];
	 */
	this.add('role:wx,cmd:message,type:news', function news(params, respond) {
		api.sendNews(params.openid, params.articles, respond)
	})

	this.add('role:wx,cmd:message,type:mpnews', function mpnews(params, respond) {
		api.sendMpNews(params.openid, params.mediaId, respond)
	})

	this.add('role:wx,cmd:message,type:image', function image(params, respond) {
		api.sendImage(params.openid, params.mediaId, respond)
	})

	this.add('role:wx,cmd:message,type:voice', function voice(params, respond) {
		api.sendVoice(params.openid, params.mediaId, respond)
	})

	this.add('role:wx,cmd:message,type:video', function video(params, respond) {
		api.sendVideo(params.openid, params.mediaId, params.thumbMediaId, respond)
	})

	/** var music = {
	*  title: '音乐标题', // 可选
	*  description: '描述内容', // 可选
	*  musicurl: 'http://url.cn/xxx', 音乐文件地址
	*  hqmusicurl: "HQ_MUSIC_URL",
	*  thumb_media_id: "THUMB_MEDIA_ID"
	* };
	*/
	this.add('role:wx,cmd:message,type:music', function music(params, respond) {
		api.sendMusic(params.openid, params.music, respond)
	})

	this.add('role:wx,cmd:message,type:card', function card(params, respond) {
		api.sendCard(params.openid, params.music, respond)
	})

	// send template message
	this.add('role:wx,cmd:message,type:template', function templateMsg(params, respond) {
		this.act({
			role: 'wx',
			cmd: 'access_token',
		}, (error, token) => {
			if (error) return respond(error)
			return axios({
				url: `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token.access_token}`,
				method: 'POST',
				data: {
					touser: params.touser,
					template_id: params.template_id,
					url: params.url,
					data: params.data,
				},
			}).then(resp => respond(null, resp.data))
				.catch(respond)
		})
	})

	// get template message list
	this.add('role:wx,cmd:message,type:template_list', function templateMsgList(params, respond) {
		this.act({
			role: 'wx',
			cmd: 'access_token',
		}, (error, token) => {
			if (error) return respond(error)
			return axios({
				url: `https://api.weixin.qq.com/cgi-bin/template/get_all_private_template?access_token=${token.access_token}`,
				method: 'GET',
			})
			.then(resp => respond(null, resp.data))
			.catch(respond)
		})
	})
}
