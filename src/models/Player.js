import User from "./User";

/**
 * Player model (user in game)
 */
class Player extends User {
    constructor(data = {}) {
        super();
        this.score = 0;
        this.lastDecision = null;
        this.isBigBlind = false;
        this.isSmallBlind = false;
        this.isCurrentPlayer = false;
        Object.assign(this, data);
    }
}
export default Player;
