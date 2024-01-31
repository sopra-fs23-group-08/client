import User from "./User";

/**
 * Player model (user in game)
 */
class Player extends User {
    constructor(data = {}) {
        super();
        this.score = 0;
        this.scorePutIntoPot = 0;
        this.lastDecision = null;
        this.bigBlind = false;
        this.smallBlind = false;
        this.currentPlayer = false;
        Object.assign(this, data);
    }
}
export default Player;
