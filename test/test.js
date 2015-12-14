var doc = require('../index.js');
var fs = require('fs');

var code = doc(fs.readFileSync('src/index.html', 'utf8'));
code += doc(fs.readFileSync('src/index.js', 'utf8'));

fs.writeFileSync('doc/doc.md', code, 'utf8');