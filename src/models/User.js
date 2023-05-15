/**
 * User model
 */
class User {
  constructor(data = {}) {
    this.username = data.username || null;
    this.token = null;
    Object.assign(this, data);
  }
}
export default User;
