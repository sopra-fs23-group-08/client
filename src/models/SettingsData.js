/**
 * Setting model
 */
class Settings {
    constructor(data = {}) {
        this.language = null;
        this.playlistUrl = null;
        this.initialBalance = null;
        this.bigBlind = null;
        this.smallBlind = null;
        Object.assign(this, data);
    }
}
export default Settings;
