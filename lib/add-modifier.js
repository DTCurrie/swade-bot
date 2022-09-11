/**
 * A module for adding modifiers to roll notation.
 * @module add-modifiers
 */

/**
 * Adds a modifier to a roll notation as a suffix when passed
 * @param {string} roll the notation for the roll
 * @param {string} modifier the modifier to apply to the roll
 * @returns {string} the roll with the modifier applied as a suffix if passed
 */
function addModifier(roll, modifier) {
	return `${roll}${modifier ?? ''}`;
}

module.exports = {addModifier};
