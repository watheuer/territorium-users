var pool = require('./connectionPool');

class UserBatch {
  constructor(ids) {
    this.ids = ids;
  }
  
  load() {
    var model = this;
    return new Promise(function(resolve, reject) {
      pool.connect((err, client, done) => {
        if (err) {
          reject(new Error('Could not connect to database.'));
          return;
        }

        const query = `SELECT * FROM USERS WHERE id=ANY($1)`;
        client.query(query, [model.ids], (err, result) => {
          done();  // release db connection
          if (err) {
            reject(new Error(`Users could not be found.`));
          } else {
            if (result.rows.length === 0) {
              reject(new Error(`None of these users exist.`));
            } else {
              model.users = result.rows;
              resolve(model);
            }
          }
        });
      });
    });
  }
  
  serialize() {
    var retarr = [];
    var user;
    for (var i=0; i<this.users.length; i++){
      user = this.users[i];
      retarr.push({
        id: user.id,
        username: user.username
      })
    }
    return retarr;
  }
  
}

module.exports = UserBatch;