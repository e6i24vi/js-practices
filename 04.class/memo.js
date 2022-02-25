#!/usr/bin/env node
'use strict';
const sqlite3 = require('sqlite3').verbose();

const argv = require('argv');
argv.option({
  name: 'list',
  short: 'l',
  type: 'string',
  description: '一覧表示'
});

argv.option({
  name: 'reference',
  short: 'r',
  type: 'string',
  description: '参照'
});

argv.option({
  name: 'delete',
  short: 'd',
  type: 'string',
  description: '削除'
});

argv.option({
  name: 'edit',
  short: 'e',
  type: 'string',
  description: '編集'
});
const memotable = 'memo';

class Memo {
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
      const titles = await this.all_(`SELECT title FROM ${memotable}`);
      titles.forEach((title) => {
        console.log(title);
      });
      this.db.close();
    })();
  }

  show () {
    (async () => {
      const titles = await this.all_(`SELECT title FROM ${memotable}`);
      const Enquirer = require('enquirer');
      const question = {
        type: 'select',
        name: 'title',
        message: 'Choose a note you want to see:',
        choices: titles
      };
      const answer = await Enquirer.prompt(question);
      const ans = await this.get_(`SELECT content from ${memotable} where title = ?`, [answer.title]);
      console.log();
      console.log(ans.content);
      this.db.close();
    })();
  }

  delete () {
    (async () => {
      const titles = await this.all_(`SELECT title FROM ${memotable}`);
      const Enquirer = require('enquirer');
      const question = {
        type: 'select',
        name: 'title',
        message: 'Choose a note you want to see:',
        choices: titles
      };
      const answer = await Enquirer.prompt(question);
      await this.delete_(`delete from ${memotable} where title = ?`, answer.title);
      this.db.close();
    })();
  }

  close () {
    this.db.close();
  }

  get_ (sql, params) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  all_ (sql) {
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

  delete_ (sql, params) {
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

const main = () => {
  const memo = new Memo();
  if (argv.run().options.list) {
    memo.index();
  } else if (argv.run().options.reference) {
    memo.show();
  } else if (argv.run().options.delete) {
    memo.delete();
  } else if (argv.run().options.edit) {
    console.log('d');
  } else {
    const lines = [];
    let title = '';
    let content = '';
    const reader = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    reader.on('line', (line) => {
      lines.push(line);
    });

    reader.on('close', () => {
      title = lines[0];
      for (let i = 0; i < lines.length; i++) {
        content += lines[i] + '\n';
      }
      memo.insert(title, content);
    });
  }
};

main();
