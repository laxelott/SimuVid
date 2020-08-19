require("./hashCode");

var processPassword = function (password) {
	return password.hashCode().toString(16);
}

module.exports = { processPassword };