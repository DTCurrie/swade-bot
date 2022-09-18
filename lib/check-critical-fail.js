/**
 * A module for checking rolls for critical failures.
 * @module check-critical-fail
 */

/**
 *
 * @param {DiceRoll} traitRoll The trait roll
 * @param {DiceRoll} [wildCardRoll] The wild card roll (optional)
 * @returns {boolean} If the roll was a critical failure
 */
function checkCriticalFail(traitRoll, wildCardRoll) {
	if (!wildCardRoll) {
		return traitRoll.rolls[0].rolls[0].initialValue === 1;
	}

	return traitRoll.rolls[0].rolls[0].initialValue === 1 && wildCardRoll.rolls[0].rolls[0].initialValue === 1;
}

module.exports = {checkCriticalFail};
