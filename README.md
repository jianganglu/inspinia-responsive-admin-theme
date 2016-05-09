### Glup前端自动化构建说明
 
#### 1、准备工作

>此教程以windows系统为例。

**Nodejs**

进入[Nodejs官网](https://nodejs.org/en/)自行下载需要的版本，windows版有提供exe安装包，下载完成双击即可安装。完成安装后，相应的npm也已安装到最新版本，不需要另外安装。（如已安装跳过此步骤）

**Git**

进入[Git官网下载页面](http://git-scm.com/download/)下载windows版本，双击即可安装。（如已安装跳过此步骤）

**Gulp**

* 全局安装Gulp：
`npm install -g gulp`

* 作为项目的开发依赖（devDependencies）安装：
`npm install --save-dev gulp`

#### 2、下载项目完成依赖包安装

* 通过`git clone <url>`克隆项目，`cd <项目名称>`进入下载的项目。

* 安装项目依赖包：(如果下载进度慢，可以尝试开启/关闭代理服务，或者更换下载镜像)
`npm install`

* 安装项目Demo演示的js库（bootstrap,jquery,requirejs和domready）
`bower install`

#### 3、 项目目录说明

完成依赖包安装后的项目的目录如下：

```
|-node_modules
|-src
  |-img
  |-js
  |-sass
  |-vendor
  |-views
|-bower.json
|-gulpfile.js
|-package.json
|-README.md
```

说明：

* node_modules：依赖包，即运行`npm install`所安装下载的依赖。
* src：项目开发目录，里面的img，js，less，vendor和views为前端所使用的开发文件目录。
* boser.json：js库依赖管理，运行`bower install`的时候，就是从这个文件读取需要下载的js库文件。
* gulpfile.js：gulp自动化构建等项目任务就在这个文件里。
* package.json：运行`npm install`的时候，就是从该文件读取所依赖的插件包，下载并放到node_modules目录下。
* README.md：项目说明文档。

>其中有两个以`.`开头的文件，分别是`.bowerrc`和`.gitignore`。前者文件里的内容指定了`bower install`时候js库文件存放的路径，后者文件里的内容是git更新和推送时候忽略同步的文件。

#### 4、 常用命令介绍

以项目已经存在的demo为例，介绍gulp的两个基础构建命令。具体可参与`gulpfile.js`文件内容。

* `gulp`：默认任务，在开发过程中可运行此任务。打开浏览器输入[http://localhost:8100/views/demo/demo.html](http://localhost:8100/views/demo/demo.html)或者[http://localhost:8100/views/](http://localhost:8100/views/)即可访问demo页面，修改开发文件并保存,可实时刷新项目页面。它包含'bundle', 'minLibCss', 'copyRequirejs', 'less', 'htmlDev', 'connect', 'images','watch' 等任务。

* `gulp prod`：生成环境所使用任务，该任务并不会监控文件变动和启动http服务，主要用于项目完成后部署使用，项目生成目录是`dist`。它包含'clean'，'bundle', 'vendorStyles', 'styles', 'rjs', 'images' 等任务。

以下针对子任务进行说明：（大家可以参考`gulp`和`gulp prod`自行构建自己需要的任务集合）

* `rjs`：根据requirejs文件依赖，合并并压缩相关的依赖js库文件到项目生成目录下。
* `vendorStyle`：合并并压缩第三方依赖样式到项目生成目录下。
* `style`：编译sass文件，合并并压缩到项目生成目录下。
* `htmlDev`： 根据开发环境让html引用开发相关的js和css文件（未压缩）。
* `htmlProd`： 根据生产环境让html引用生产相关的js和css文件（压缩）。
* `browser-sync`：http服务。
* `images`: 图片文件夹拷贝到项目生成目录下（未添加图片压缩）。
* `gulp`：监控文件变化，包括'images','bundle','less','htmlDev'。


>以上子任务也可以单独运行，使用命令`gulp [ser]`就可以单独运行任务，其中[ser]为上面介绍的子任务。




