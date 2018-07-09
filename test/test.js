const fs = require('fs');
const slueStream = require('../index.js');
var readerStream1 = fs.createReadStream('../index.js');
var readerStream2 = fs.createReadStream('../../slue/src/app.js');

slueStream.combine([readerStream1, readerStream2]).pipe(slueStream.transform((chunk, enc, cb)=> {
    console.log(chunk.toString());
    console.log("====================================");
    cb();
}));