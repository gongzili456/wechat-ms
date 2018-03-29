import Debug from 'debug'
import config from 'config'
import fs from 'fs'
import path from 'path'
import { Payment } from 'wechat-pay'

const debug = new Debug('app:plugins:payment:')

const initConfig = {
	partnerKey: config.wx.partner_key,
	appId: config.wx.appid,
	mchId: config.wx.mch_id,
	notifyUrl: config.wx.notify_url,
	pfx: fs.readFileSync(path.join(__dirname, '../cert/apiclient_cert.p12')),
}

debug('initConfig: ', initConfig)
const payment = new Payment(initConfig)

export default function pay(options) {
	this.add('role:wx,cmd:pre_pay', function prePay(params, respond) {
		// const order = {
		// 	body: '吮指原味鸡 * 1',
		// 	attach: '{"部位":"三角"}',
		// 	out_trade_no: +new Date,
		// 	total_fee: 1,
		// 	spbill_create_ip: '127.0.0.1',
		// 	openid: 'oOVCfwWkBMGri4CK4HFn4npINYxM',
		// 	trade_type: 'JSAPI',
		// }

		payment.getBrandWCPayRequestParams(params.order, (err, result) => {
			if (err) return respond(err)
			return respond(null, result)
		})
	})

	this.add('role:wx,cmd:pre_pay', function prePay(params, respond) {
		if (!params.order) {
			return respond(new Error('order is required.'))
		}
		return this.prior(params, respond)
	})
}
