'use strict';
var through = require('through2');
var path = require('path');
var doc = require('lazy-doc');
var handle = require('./gulp-handle.js');
var fs = require('fs');

//[ 默认配置文件
var default_config = {
    output: 'readme.md', //输出文件位置
    keepExt: '.md', // 符合该扩展名的文件编译时不清除注释外内容
    // 处理$开始的函数
    plugin: {
        file: function () {
        },
        compile: function () {
        }
    },
    // 每一个注释片段处理前调用的函数
    beforeAnalysis: function () {

    },
    // 每一个注释片段处理后调用的函数
    onAnalysis: function () {

    }
};
//]

function getNewPath(oldFilePath, newPath) {
    if (!newPath || !oldFilePath) {
        return newPath;
    }
    if (path.isAbsolute(newPath)) {
        return newPath;
    }
    var base = path.dirname(oldFilePath);
    return base + '/' + newPath;
}

function getFolderFiles(dir) {
    var results = [];
    var list = fs.readdirSync(dir)
    list.forEach(function (file) {
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) results = results.concat(getFolderFiles(file))
        else results.push(file)
    });
    return results;
}

default_config.plugin = {
    /**@ 假如注释以$开始，则调用下列处理程序*/
    /**@ 引用文件
     * @usage: file index.js
     * */
    file: function (data, args) {
        if (data || args) {
            var src = typeof args === 'string' ? args : args.src;
            data.out = fs.readFileSync(getNewPath(data.file.path, src), 'utf8');
        }
    },
    /**@ 引入目录下的所有文件，包含子目录
     * @useage: compile_folder src
     * */
    folder: function (data, args) {
        var folder = typeof args === 'string' ? args : args.folder;
        var dir = getNewPath(data.file.path, folder);
        var files = getFolderFiles(dir);
        data.out = '';
        for (var i = 0; files && i < files.length; i++) {
            console.log('引入文件： ', files[i]);
            data.out += fs.readFileSync(files[i], 'utf8')
        }
    },

    /**@ 编译文件注释
     * @useage: compile index.js
     * */
    compile: function (data, args) {
        if (data && args) {
            var src = typeof args === 'string' ? args : args.src;
            data.out = doc.compileFile(getNewPath(data.file.path, src));
        }
    },
    /**@ 编译文件路径
     * @useage: compile_folder src
     * */
    compile_folder: function (data, args) {
        var folder = typeof args === 'string' ? args : args.folder;
        var dir = getNewPath(data.file.path, folder);
        var files = getFolderFiles(dir);
        // console.log(files);
        data.out = '';
        for (var i = 0; files && i < files.length; i++) {
            data.out += doc.compileFile(files[i]);
        }
    }
};

module.exports = function (opt) {
    var config = doc.extend(opt, default_config, -1);
    var output = '';
    var File = null;

    doc.on('before_compile', function (data) {
        if (!data.file) {
            data.file = File;
        }
        data.compile = doc;
        data.config.keep = false;
        if (data.file) {
            var ext = path.extname(data.file.path).toLowerCase();
            if (config.keepExt && (',' + config.keepExt + ',').indexOf(',' + ext + ',') >= 0) {
                data.config.keep = true;
            }
        }
    });
    doc.on('before_analysis', function (data) {
        if (!data.file) {
            data.file = File;
        }
        // console.log('before_analysis', data.file.path, data.config);
        if (typeof config.beforeAnalysis === 'function') {
            return config.beforeAnalysis(data);
        }
    });
    doc.on('analysis', function (data) {
        if (!data.file) {
            data.file = File;
        }
        if (data.block.match(/^\s*\$/)) {
            analysisMethod(data);
        }
        if (typeof config.onAnalysis === 'function') {
            return config.onAnalysis(data);
        }
    });
    /** 扩展处理程序*/
    doc.compileFile = function (filePath) {
        console.log('编译文件:' + filePath);
        if (!fs.existsSync(filePath)) {
            console.log('文件不存在： ', filePath);
            return;
        }
        var file = {
            path: filePath,
            content: fs.readFileSync(filePath, 'utf-8')
        };
        File = file;
        return doc.compile(file.content + '', config);
    };

    handle.onFile = function (file) {
        File = file;
        console.log('编译文件:' + file.path);
        output += doc(String(file.contents) + '', config);
    };
    handle.onEnd = function () {
        if (config.output && output) {
            console.log("写入文件：", config.output);
            handle.pushFile(config.output, output);
        }
    };
    return handle.handle;
};


/**分析执行函数参数,$开始的处理*/
function analysisMethod(data) {
    var code = data.block;
    var funcName;
    code = code.replace(/\s*\$(\w+)/, function (a, b) {
        funcName = b;
        return '';
    });
    var func = data.config.plugin[funcName];
    if (!func) {
        try {
            console.error('未知处理程序：' + funcName, data.block);
        }
        catch (e) {

        }
    }
    var argus = code.trim().split('\n');
    if (argus.length <= 1 && code.trim().indexOf(' ') < 0) {
        return func(data, code.trim());
    }
    var args = {};
    for (var i = 0; i < argus.length; i++) {
        var attrs = argus[i].trim().split(/\s+/);
        if (attrs[0]) {
            args[attrs[0]] = attrs[1] || '';
        }
    }
    return func(data, args);
}
