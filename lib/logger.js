function output(action, label, message, data) {
	if (process.env.NODE_ENV === 'production') {
		return;
	}

	console[action](`[${label}] ${message}:\n\t`, data);
}

function log(label, message, data) {
	output('log', label, message, data);
}

function info(label, message, data) {
	output('info', label, message, data);
}

function warn(label, message, data) {
	output('warn', label, message, data);
}

function error(label, message, data) {
	output('error', label, message, data);
}

module.exports = {
	log,
	info,
	warn,
	error,
};
