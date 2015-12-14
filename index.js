'use strict';
var through = require('through2');
var path = require('path');
var doc = require('lazy-doc');
/**
 * */
module.exports = function (opt) {
    /**start默认设置*/
    var default_config = {
        output: 'readme.md' //输出文件位置
    };
    /**end*/


    var config = doc.extend(opt, default_config);
    var output = '', backFile = null;
    console.log(config);

    function bufferContents(file, enc, cb) {
        // 空文件直接跳转
        if (file.isNull()) {
            cb();
            return;
        }
        // we don't do streams (yet)
        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-lazy-doc', '不支持流式模式'));
            cb();
            return;
        }
        backFile = file;
        console.log(file);
        output += doc(String(file.contents) + '', config);
        cb();
    }

    /**当所有一系列的文件处理完毕后会调用endStream*/
    function endStream(cb) {
        // no files passed in, no file goes out
        if (!backFile) {
            cb();
            return;
        }
        console.log(output);
        if (config.output && output) {
            pushFile(config.output, output, this);
        }
        cb();
    }

    function pushFile(name, content, that) {
        if (!that) {
            console.error('未知文件流!');
        }
        if (content.trim().length == 0) {
            return;
        }
        var file = backFile.clone({contents: false});
        file.path = path.join(backFile.base, name);
        file.contents = new Buffer(content);
        that.push(file);
    }

    return through.obj(bufferContents, endStream);
};
