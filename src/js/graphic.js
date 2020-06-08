/* global d3 */
import guessMovement from './guessMovement';
import familyLines from './familyLines';

function resize() {
	console.log('Resize!');
	guessMovement.resize();
	familyLines.resize();
}

function init() {
  console.log('Make something awesome!');
  guessMovement.init();
  familyLines.init();
}

export default { init, resize };
