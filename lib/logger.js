/**
 * A module for logging to the console.
 * @module logger
 */

/**
 * Outputs a message and optional data to the console
 * @param {'log' | 'info' | 'warn' | 'error'} action the type of log statement to make
 * @param {string} label the log label, will be wrapped in brackets: [label]
 * @param {string} message the message to log
 * @param {unknown} [data] the data to log after the message
 * @returns void
 */
function output(action, label, message, data) {
	if (process.env.NODE_ENV === 'production') {
		return;
	}

	console[action](`[${label}] ${message}:\n\t`, data);
}

/**
 * Outputs a log message and optional data to the console
 * @param {string} label the log label, will be wrapped in brackets: [label]
 * @param {string} message the message to log
 * @param {unknown} [data] the data to log after the message
 * @returns void
 */
function log(label, message, data) {
	output('log', label, message, data);
}

/**
 * Outputs an info message and optional data to the console
 * @param {string} label the log label, will be wrapped in brackets: [label]
 * @param {string} message the message to log
 * @param {unknown} [data] the data to log after the message
 * @returns void
 */
function info(label, message, data) {
	output('info', label, message, data);
}

/**
 * Outputs a warn message and optional data to the console
 * @param {string} label the log label, will be wrapped in brackets: [label]
 * @param {string} message the message to log
 * @param {unknown} [data] the data to log after the message
 * @returns void
 */
function warn(label, message, data) {
	output('warn', label, message, data);
}

/**
 * Outputs an error message and optional data to the console
 * @param {string} label the log label, will be wrapped in brackets: [label]
 * @param {string} message the message to log
 * @param {unknown} [data] the data to log after the message
 * @returns void
 */
function error(label, message, data) {
	output('error', label, message, data);
}

module.exports = {
	log,
	info,
	warn,
	error,
};
