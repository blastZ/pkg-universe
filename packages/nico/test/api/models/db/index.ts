class DB {
  users: { id: number; name: string }[] = [];

  async saveUser(name: string) {
    const user = { id: this.users.length + 1, name };
    this.users.push(user);
    return user;
  }

  async getUsers() {
    return this.users;
  }
}

export default new DB();
