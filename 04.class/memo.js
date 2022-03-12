#!/usr/bin/env node
'use strict';

const MemoDB = require('./memodb.js')

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

const main = () => {
  const memo = new MemoDB();
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
