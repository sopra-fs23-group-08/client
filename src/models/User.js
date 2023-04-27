/**
 * User model
 */
class User {
  constructor(data = {}) {
    this.name = null;
    this.token = null;
    Object.assign(this, data);
  }
}
export default User;
