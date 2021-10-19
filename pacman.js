/* global Character,  */

class Pacman extends Character {
  constructor(cells, startPosition, becomeHunter, handleMovement) {
    super(cells, "pacman", startPosition);

    this.becomeHunter = becomeHunter;
    this.handleMovement = handleMovement;
  }
}
