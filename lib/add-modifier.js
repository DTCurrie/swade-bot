function addModifier(roll, modifier) {
	return `${roll}${modifier ?? ''}`;
}

module.exports = {addModifier};
