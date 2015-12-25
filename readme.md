# 懒人文档生成工具
* 根据注释自动生成文档
* 设置注释开始标志和结束标志，和常用注释区分开
* 自动读取注释后函数
* 引用一个文件的注释
* 引用一个文件
* 引用一个文件夹
* todo 引用某一个文件中的一部分
* 生成md文档
* todo 添加目录链接
* todo 生成html文档（带目录结构）


##  默认配置文件
```
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
```

##  假如注释以$开始，则调用下列处理程序
## file:(data, args)  引用文件
```
 @usage: file index.js
```

## folder:(data, args)  引入目录下的所有文件，包含子目录
```
 @useage: compile_folder src
```

## compile:(data, args)  编译文件注释
```
 @useage: compile index.js
```

## compile_folder:(data, args)  编译文件路径
```
 @useage: compile_folder src
```




## 测试html提示内容
## Test(param1, param2)  测试api文档生成器
```
 参数列表:
      param1: 第一个参数
      param2： 第二个参数
```

## Test2 (param1,param2)  测试第二个内容
```
 参数: param1 string
 参数: param2 string
```

## ', end: '
## ', end: '
## 测试html提示内容
## Test(param1, param2)  测试api文档生成器
```
 参数列表:
      param1: 第一个参数
      param2： 第二个参数
```

## Test2(param1,param2)  测试第二个内容
```
 参数: param1 string
 参数: param2 string
```



### 使用示例
```
var gulp = require('gulp');
var doc = require('gulp-lazy-doc');

gulp.task('default', function () {
    gulp.src(['_readme.md'])
        .pipe(doc({
            output: 'readme.md',
            scopes: [{start: '/**@', end: '*/'}, {start: '<!--', end: '-->'}, {start: '//[', end: '//]'}]
        }))
        .pipe(gulp.dest('./'));
});  
```