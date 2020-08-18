/* global d3 */
import guessMovement from './guessMovement';
import familyLines from './familyLines';

function resize() {
	guessMovement.resize();
	familyLines.resize();
}

function init() {
  guessMovement.init();
  familyLines.init();
}

export default { init, resize };
