/**
 * A module for simulating dice rolls.
 * @module rolls
 */

const {DiceRoll} = require('@dice-roller/rpg-dice-roller');
const {checkCriticalFail} = require('./check-critical-fail');
const {log} = require('./logger');

/**
 * Adds a modifier to a roll notation as a suffix when passed
 * @param {string} roll the notation for the roll
 * @param {string} modifier the modifier to apply to the roll
 * @returns {string} the roll with the modifier applied as a suffix if passed
 */
function addModifier(roll, modifier) {
	return `${roll}${modifier ?? ''}`;
}

/**
 * Makes a wild card trait roll
 * @param {string} commandName The name of the command that triggered the roll (for logging)
 * @param {number} trait The trait die to roll
 * @param {string} modifier The modifier to apply to the roll
 * @returns {{ result: number, critical: boolean, roll: DiceRoll, wildRoll: DiceRoll}}
 */
function wildCardTraitRoll(commandName, trait, modifier) {
	log(commandName, 'wildCardTraitRoll', {trait, modifier});
	const traitCommand = addModifier(`d${trait}!!`, modifier);
	const wildCardCommand = addModifier('d6!!', modifier);

	log(commandName, 'wildCardTraitRoll commands', {traitCommand, wildCardCommand});
	const roll = new DiceRoll(traitCommand);
	const wildRoll = new DiceRoll(wildCardCommand);

	log(commandName, 'wildCardTraitRoll rolls', {traitRoll: roll.output, wildCardRoll: wildRoll.output});
	const critical = checkCriticalFail(roll, wildRoll);

	const result = roll.total >= wildRoll.total ? roll.total : wildRoll.total;
	log(commandName, 'wildCardTraitRoll result', result);

	return {
		result,
		critical,
		roll,
		wildRoll,
	};
}

/**
 * Makes a wild card trait reroll
 * @param {string} commandName The name of the command that triggered the roll (for logging)
 * @param {number} trait the trait die to reroll
 * @param {modifier} modifier the modifiers to apply to the reroll
 * @returns {{ rerollResult: number, criticalReroll: boolean, reroll: DiceRoll, wildReroll: DiceRoll}}
 */
function wildCardTraitReroll(commandName, trait, modifier, last) {
	const {critical, roll, wildRoll} = wildCardTraitRoll(commandName, trait, modifier);
	const rollTotal = roll.total >= wildRoll.total ? roll.total : wildRoll.total;

	const rerollResult = rollTotal >= last ? rollTotal : last;
	log(commandName, 'wildCardTraitReroll rerollResult', rerollResult);

	return {
		rerollResult,
		criticalReroll: critical,
		reroll: roll,
		wildReroll: wildRoll,
	};
}

/**
 * Handles an extra trait roll
 * @param {string} commandName The name of the command that triggered the roll (for logging)
 * @param {number} trait The trait die to roll
 * @param {string} modifier The modifier to apply to the roll
 * @returns {{ result: number, critical: boolean, roll: DiceRoll, output: string }}
 */
function extraTraitRoll(commandName, trait, modifier) {
	log(commandName, 'extraTraitRoll', {trait, modifier});

	const command = addModifier(`d${trait}!!`, modifier);
	log(commandName, 'extraTraitRoll command', command);

	const roll = new DiceRoll(command);
	log(commandName, 'extraTraitRoll roll', roll.output);

	const critical = checkCriticalFail(roll);

	return {
		result: roll.total,
		critical,
		roll,
		output: roll.output,
	};
}

/**
 * Makes an extra trait reroll
 * @param {string} commandName The name of the command that triggered the roll (for logging)
 * @param {number} trait the trait die to reroll
 * @param {modifier} modifier the modifiers to apply to the reroll
 * @returns {{ rerollResult: number, criticalReroll: boolean, reroll: DiceRoll, rerollOutput: string}}
 */
function extraTraitReroll(commandName, trait, modifier, last) {
	const {result, critical, roll, output} = extraTraitRoll(commandName, trait, modifier);

	const rerollResult = result >= last ? result : last;
	log(commandName, 'extraTraitReroll rerollResult', rerollResult);

	return {
		rerollResult,
		criticalReroll: critical,
		reroll: roll,
		rerollOutput: output,
	};
}

/**
 * Calculate the amount of raises a successful trait roll has
 * @param {number} result The result of the roll
 * @returns {number} The amount of raises
 */
function calculateTraitRollRaises(result) {
	// Reduce one to not reflect the initial success
	return Math.floor(result / 4) - 1;
}

/**
 * Calculate the amount of raises a successful melee roll has
 * @param {number} result The result of the roll
 * @param {number} parry The parry value of the target
 * @returns {number} The amount of raises
 */
function calculateMeleeRollRaises(result, parry) {
	return Math.floor((result - parry) / 4);
}

module.exports = {
	addModifier,

	wildCardTraitRoll,
	wildCardTraitReroll,

	extraTraitRoll,
	extraTraitReroll,

	calculateTraitRollRaises,
	calculateMeleeRollRaises,
};
