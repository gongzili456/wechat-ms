export default args => {
	let keys = Object.keys(args)
	keys = keys.sort()
	const newArgs = {}
	keys.forEach(key => {
		newArgs[key.toLowerCase()] = args[key]
	})

	let string = ''
	for (const k in newArgs) {
		string += '&' + k + '=' + newArgs[k]
	}
	string = string.substr(1)
	return string
}
