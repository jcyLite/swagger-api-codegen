# 通过swagger文档，编译处api层代码

## 安装
```bash
yarn global add swagger-api-codegen
npm install -g swagger-api-codegen
```
## cli主要命令

| 功能 | 命令 |  别名 | 作用 |
|------|------|------| ----- |
| 帮助 | swagger --help | swagger -h | 显示swagger的所有相关命令 |
| 显示版本号 | swagger --version | swagger -V | |
| 初始化项目配置文件 | swagger init | 无 | 在根目录上生成配置 |
| 查看api的html | swagger view api | swagger v api | 创建一个http服务，显示swagger界面 |
| 根据swagger生成mock数据 | swagger generate mock | swagger g mock | 在根目录下生成一个mock文件夹，通过swagger类型推导mock数据类型 |
| 根据swagger生成api层代码 | swagger generate api | swagger g api  | 在src中的api目录下生成相应的api层代码，并将后端类型补充进去，使得前端调用api层时有各种类型推导 |
| 生成fetch层的代码（每个api都会引入的文件） | swagger generate fetch | swagger g fetch | 生成fetch层的代码，api层的依赖  |

## 未来计划

swagger view api 中可以编辑api层