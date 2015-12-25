var through = require('through2');
var path = require('path');
module.exports = (function () {
    var data = {
        handle: function () {
            return through.obj(bufferContents, endStream);
        }, //留做gulp监听使用
        onFile: function (file) {
            return file;
        }, // 当有文件时使用
        onEnd: function () {
        },
        // 当结束时调用
        pushFile: pushFile //
    };

    var backFile = null;


    function bufferContents(file, enc, cb) {
        backFile = file;
        // 空文件直接跳转
        if (file.isNull()) {
            cb();
            return;
        }
        // we don't do streams (yet)
        if (file.isStream()) {
            this.emit('error', new PluginError('不支持流式模式'));
            cb();
            return;
        }
        data.onFile && data.onFile(file);
        cb();

    }

    /**当所有一系列的文件处理完毕后会调用endStream*/
    function endStream(cb) {
        // no files passed in, no file goes out
        if (!backFile) {
            cb();
            return;
        }
        data.onEnd && data.onEnd();
        cb();
    }

    /**@添加文件(必须在onFile或者onEnd执行之后调用)
     * @params：
     *      name string 文件名
     *      content string 文件内容
     * */
    function pushFile(name, content) {
        if (content.trim().length == 0) {
            return;
        }
        var file = backFile.clone({contents: false});
        file.path = path.join(backFile.base, name);
        file.contents = new Buffer(content);
        data.handle.push(file);
    }

    data.handle = through.obj(bufferContents, endStream);
    return data;
})();