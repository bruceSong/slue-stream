const util = require('util');
const stream = require('stream');
const xtend = require('xtend');

function Transform(config) {
    stream.Transform.call(this, config);
}
util.inherits(Transform, stream.Transform);

function getTransForm(transform, config) {
    if (!util.isFunction(transform)) {
        transform = function(obj, env, cb) {
            this.push(obj);
            cb();
        };
    }

    let transformInstance = new Transform(config);
    transformInstance._transform = transform;
    return transformInstance;
}

function getTransformObj(transform, config) {
    if (!util.isFunction(transform)) {
        transform = function(obj, env, cb) {
            this.push(obj);
            cb();
        };
    }

    return getTransForm(transform, xtend({
        objectMode: true,
        highWaterMark: 500
    }, config));
}

// function addStream(streams, stream) {
//     if (!stream.readable) {
//         throw new Error('all input streams must be readable');
//     }

//     let self = this;
//     stream._buffer = stream._buffer || [];
//     stream.on('data', function(chunk) {
//         if (stream == streams[0]) {
//             self.push(chunk);
//         } else {
//             stream._buffer.push(chunk);
//         }
//     });
//     stream.on('end', function() {
//         let stream = streams[0];
//         while (stream && stream._readableState.ended) {
//             while (stream._buffer.length) {
//                 self.push(stream._buffer.shift());
//             }
//             streams.shift();
//             stream = streams[0];
//         }
//     });
//     self.setMaxListeners(50);
// }
function addStream(streams, stream) {
    if (!stream.readable) throw new Error('All input streams must be readable');

    if (this._readableState.ended) throw new Error('Adding streams after ended');

    var self = this;

    stream._buffer = [];

    stream.on('data', function(chunk) {
        if (this === streams[0])
            self.push(chunk);

        else
            this._buffer.push(chunk);
    });

    stream.on('end', function() {
        for (var stream = streams[0]; stream && stream._readableState.ended; stream = streams[0]) {
            while (stream._buffer.length)
                self.push(stream._buffer.shift());

            streams.shift();
        }

        if (!streams.length) self.push(null);
    });

    stream.on('error', this.emit.bind(this, 'error'));

    streams.push(stream);
}

function Combine(streams) {
    stream.Readable.call(this, {
        objectMode: true
    });

    let __addStream = addStream.bind(this, streams);

    streams.forEach(__addStream);
}
util.inherits(Combine, stream.Readable);

function getCombine(streams, config) {
    if (!util.isArray(streams)) {
        throw new Error('streams must be arrat');
    }

    let readableStream = new Combine(streams);
    readableStream._read = function() {};
    return readableStream;
}

module.exports = {
    transform: getTransForm,
    transformObj: getTransformObj,
    combine: getCombine
};