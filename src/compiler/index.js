import { parseHtml } from "./parseHtml"
import { generate } from "./generateCode"

export function compileToFunctions(template) {
  // 模版编译，将html模版 => render 函数

  // 1、html 代码转换成 ast 语法树
  const ast =  parseHtml(template)
  // 2、标记静态节点

  // 3、ast 转换成字符串 strCode，字符串中包括 _c, _v, _s 等方法, 分别用来标识 DOM 节点、文本节点、以及变量
  const strCode = generate (ast)
  _c('div',
     {
       id: "app",class: "main",style: {"width":" 20px"," color":" red"}
     },
     _c('span',null,_v("Hello "+_s(name))),
     _c('p',null,_v("World"))
    )

  // 4、将字符串通过 new Function(`with(this){return ${strCode}}`) 转换成 render 函数
  const render = new Function(`with(this){return ${strCode}}`)
  
  return render
}