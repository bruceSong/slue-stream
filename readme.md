# slue-stream

文档流工具。

## transformObj
```javascript
    const slueStream = require('slue-stream');
    let sluePlugin = slueStream.transformObj(function(file, evn, cb) {
        cb(null, file);
    });
```

## combine
合并多个stream
```javascript
    let stream = slueStream.combine([stream1, stream2])
```