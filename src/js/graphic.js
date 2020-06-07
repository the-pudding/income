/* global d3 */
import guessMovement from './guessMovement';

function resize() {
	console.log('Resize!');
	guessMovement.resize();
}

function init() {
  console.log('Make something awesome!');
  guessMovement.init();
}

export default { init, resize };
