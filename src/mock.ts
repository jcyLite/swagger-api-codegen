import { IMockConfig } from "./typings/mock";
import * as path from "path"
const swaggerParserMock = require('swagger-parser-mock');
const fs = require('fs');
import * as fse from "fs-extra"
import { is } from "@babel/types";
import { formatTypescript } from "./util/prettier.common";
const mkdirp = require('mkdirp')
var Mock = require('mockjs')
class Mocker {
    url="";
    cwd = process.cwd()
    exclude = [];
    include = [];
    dir = "mock"
    dataLength = "1-8"
    content = ""
    fileName = "index.ts"
    prefix = "/"
    async init({ url, exclude = [], dir = 'mock', dataLength = '1-8', fileName = 'index.ts', include = [], prefix = "/" }: IMockConfig) {
        this.url = url;
        this.exclude = exclude;
        this.include = include;
        this.dir = dir;
        this.dataLength = dataLength;
        this.fileName = fileName;
        this.prefix = prefix
        await this.parse() //解析
        if (this.content) {
            await this.writeToMockFile(this.dir, this.fileName, this.content)
            return ({ state: 'success', content: this.content })
        } else {
            return ({ state: 'failed' })
        }
    }
    async writeToMockFile(dir:string, fileName:string, content:string) {
        // 写入文件
        let temp = '';
        temp += formatTypescript(`
            export default {
                ${content}
            }
        `)
        fse.writeFileSync(path.resolve(this.cwd, `${dir}/${fileName}`), temp)
        return true
    }
    // 解析swagger-api-doc
    async parse() {
        const { paths } = await swaggerParserMock(this.url)
        await this.checkFileExist()
        this.traverse(paths)
        if (!paths) return;

    }
    // 初始化目录 判断是否有该文件
    checkFileExist() {
        return new Promise((resolve, reject) => {
            fse.ensureFileSync(path.resolve(this.cwd,this.dir,this.fileName))
            resolve(void 0)
        })
    }

    // 遍历paths
    traverse(paths) {
        let index = 0;
        this.content = ''
        for (let path in paths) {
            index++
            this.traverseMethod(paths, path)
            if (this.exclude.length && !this.exclude.includes(path.match(/[a-zA-z]+/g)[0])) {
                this.traverseMethod(paths, path)
            }
        }
    }

    // 遍历某模块下的所有方法
    traverseMethod(paths, path) {
        for (let method in paths[path]) {
            const summary = paths[path][method]['summary'];
            const response = paths[path][method]['responses']['200'];
            this.generate(summary, response['example'], method, path);
        }
    }
    // 生成指定格式的文件后写入到指定文件中
    async generate(summary, example, method, path) {
        try {
            const data = this.generateTemplate({ summary, example, method, path });
            this.content += data
        } catch (error) { }
    }

    // 生成mock api模版 
    generateTemplate({ summary, example, method, path }) {
        console.log(path)
        // api path中的{petId}形式改为:petId
        const data = formatResToMock(path, example, this.dataLength);
        let str = `true`;
        str = JSON.stringify(Mock.mock(JSON.parse(data.replace(/null/g, '') || `true`)))
        return `
    // ${summary}
    '${method.toUpperCase()} ${path}': (req, res) => {
      res.send(${str});
    },
    `;
    }
};

// 格式化mock，如果是menu直接拿/mock/menu.json,其它如果是数组，自动添加多条数据
function formatResToMock(path, res, dataLength) {
    let data = '';

    if (path.includes('menu')) {
        data = `require('./menu.json')`;
    } else {
        let praseRes = JSON.parse(res);

        Object.keys(praseRes).forEach(key => {
            if (Array.isArray(praseRes[key])) {
                praseRes[`${[key]}|${dataLength}`] = praseRes[key];
                delete praseRes[key];
            }
        });
        data = `${JSON.stringify(praseRes)}`;
    }
    return data;
}


export const synchronizeSwagger = new Mocker()