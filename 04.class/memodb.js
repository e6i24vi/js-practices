
const sqlite3 = require('sqlite3').verbose();
const memotable = 'memo';
module.exports = class MemoDB {
  constructor () {
    this.db = new sqlite3.Database('./memo.db');
    this.db.serialize(() => {
      this.db.run(`create table if not exists ${memotable} (
      title text primry key,
      content text
      )`);
    }
    );
  }

  insert (title, content) {
    this.db.serialize(() => {
      this.db.run(`insert into ${memotable} VALUES(?,?)`, title, content);
    });
    this.db.close();
  }

  index () {
    (async () => {
      const titles = await this.#all(`SELECT title FROM ${memotable}`);
      titles.forEach((title) => {
        console.log(title);
      });
      this.db.close();
    })();
  }

  show () {
    (async () => {
      const titles = await this.#all(`SELECT title FROM ${memotable}`);
      const Enquirer = require('enquirer');
      const question = {
        type: 'select',
        name: 'title',
        message: 'Choose a note you want to see:',
        choices: titles
      };
      const answer = await Enquirer.prompt(question);
      const ans = await this.#get(`SELECT content from ${memotable} where title = ?`, [answer.title]);
      console.log();
      console.log(ans.content);
      this.db.close();
    })();
  }

  delete () {
    (async () => {
      const titles = await this.#all(`SELECT title FROM ${memotable}`);
      const Enquirer = require('enquirer');
      const question = {
        type: 'select',
        name: 'title',
        message: 'Choose a note you want to see:',
        choices: titles
      };
      const answer = await Enquirer.prompt(question);
      await this.#delete(`delete from ${memotable} where title = ?`, answer.title);
      this.db.close();
    })();
  }

  close () {
    this.db.close();
  }

  #get (sql, params) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  #all (sql) {
    return new Promise((resolve, reject) => {
      const titles = [];
      this.db.all(sql, (err, rows) => {
        if (err) {
          throw reject(err);
        }
        rows.forEach((row) => {
          titles.push(row.title);
        });
        resolve(titles);
      });
    });
  }

  #delete (sql, params) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  }
}
