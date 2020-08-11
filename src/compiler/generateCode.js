// <div id="app" style="width: 20px; color: red;"><span>Hello {{name}} World</span></div>
// 转换成
// _c('div', {id: 'app', style: {width: 20px, color: red}}, _c())

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配大括号 {{}}
// 生成 DOM 属性
function genPropertyData (attrs) {
  if (!(attrs && attrs.length)) return false
  let str = ''
  attrs.forEach(attr => {
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').map(item => {
        let [k, v] = item.split(':')
        obj[k] = v
      })
      attr.value = obj
    }
    str += `${attr.name}: ${JSON.stringify(attr.value)},`
  });
  return `{${str.slice(0, -1)}}` // 删除最后一个 ,
}
// 生成字节点
function genChildren (children) {
  if (!(children && children.length)) return false
  return children.map(child => gen(child)).join(',')
}

function gen (node) {
  if (node.type === 1) { // DOM 节点
    return generate(node)
  } else {
    // 文本节点, eg: `Hello {{name}}`, 需要匹配大括号里面的值
    // _v('Hello'+ _s(name))
    const {text} = node
    if (!defaultTagRE.test(text)) {
      // 纯文本
      return `_v(${JSON.stringify(text)})`
    } else {
      let tokens = []
      let match, index
      let lastIndex = defaultTagRE.lastIndex = 0;
      while(match = defaultTagRE.exec(text)) {
        index = match.index
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex,index)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length
        
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      return `_v(${tokens.join('+')})`;
    }
  }
}

export function generate(ast) {
  const children = genChildren(ast.children)
  const attrs = genPropertyData(ast.attrs)
  let strCode = `_c('${ast.tag}',${attrs ? attrs : 'undefined'},${children ? children : ''})`
  return strCode
}