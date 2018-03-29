const seneca = require('seneca')()
seneca.client({
	// type: 'tcp',
	host: 'localhost',
	port: 3000,
})
// seneca.act('role:wx,cmd:access_token,appid:wxfe332804272a69ee', function (err, result) {
// 	console.log('err: ', err, 'result: ', result)
// })
seneca.act(`role:wx,cmd:message,type:articles,openid:oOVCfwWkBMGri4CK4HFn4npINYxM,articles:${JSON.stringify([{title: 'title'}])}`, function (err, result) {
	console.log('err: ', err, 'result: ', result)
})
