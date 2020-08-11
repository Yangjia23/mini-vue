// Regular Expressions for parsing tags and attributes
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// ncname 标签名
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
// ?: 匹配不捕获 
// qnameCapture my:xxx
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配开头标签,匹配到的是标签名
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配结束标签
// 匹配属性的,3种情况  class = "aaa" | class = 'aaa' | aaa
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配大括号 {{ }}
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/



/**
 * @description 使用正则匹配解析html中的标签、属性、文本等，生成ast语法树。
 * 解析流程是，将 html 从头匹配，匹配成功后，就删除匹配成功的字符串，直到html为0，就表示整个 html 匹配结束了
 * @param {*} template
 * @returns {ast}
 */
export function parseHtml(html){
  let root = ''
  let currentEle = '' //标记当前正在处理的DOM 节点
  let stackList = [] // 用栈来为何 DOM 节点之间的层级关系
  
  while(html) {
    // 1、判断是否以 < 开头
    let textEnd = html.indexOf('<')
    if (textEnd === 0) {
      // 可以肯定标签
      // 1-1 判断是否是开始标签
      const startTagMatch = parseStartTag(html)
      if (startTagMatch) {
        start(startTagMatch);
        continue;
      }

      // 1-2 可能是结束标签
      const endTagMatch = html.match(endTag)
      if (endTagMatch) {
        end(endTagMatch[1])
        advance(endTagMatch[0].length)
        continue;
      }
    }

    let text = ''
    if (textEnd > 0) { 
      // 表示是 文本  例如：`Hello World</div>`, 从 0 - textEnd 表示的就是文本
      text = html.substring(0, textEnd)
    }
    if (text) {
      chart(text) // 处理文本节点
      advance(text.length) // 删除匹配成功的， 此时就剩匹配 </div> 结束标签了
    }
  }

  function advance (n) {
    html = html.substring(n).trim()
  }

  function parseStartTag() {
    const startTag = html.match(startTagOpen) 
    
    if (startTag) {
      const match = {
        tagName: startTag[1],
        attrs: []
      }
      // 匹配成功后，就需要在 html 中删除已经匹配的字符长度
      advance(startTag[0].length)
      
      // 开始匹配标签中的属性 <div id="app" class="main">
      // 当匹配到开始标签中的 > 就表示中间的属性都匹配完成了（结束标识）
      let end
      let attr
      while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] // id = "xxx", id ='xxx', id=xxx
        })
        // 删除匹配成功的
        advance(attr[0].length)
      }
      // 
      if (end) {
        advance(end[0].length)
        return match
      }
    }
  }

  function createAstElement (tagName, attrs) {
    return {
      tag: tagName,
      type: 1, // dom节点类型都为 1
      children: [],
      attrs,
      parent: null
    }
  }

  function start({tagName, attrs}) {
    let element = createAstElement(tagName, attrs)
    if (!root) {
      root = element
    }
    currentEle = element
    stackList.push(element) // 处理开始标签进栈，处理结束标签出栈
  }

  function end(tagName){
    // 结束标签出栈
    let element = stackList.pop()
    
    // <div><span><p></span></p></div> 当出现标签嵌套就应该报错
    // 例如： <div><span><p></span>,
    // tagName 为 span, 栈中取出的 element 为 p, 二者不想等，应该报错
    if (element.tag === tagName) {
      // <div><span></span><p></p></div>
      currentEle = stackList[stackList.length - 1] 
      if (currentEle) {
        // 双向绑定
        element.parent = currentEle 
        currentEle.children.push(element)
      }
    }
  } 
  function chart(text){
    // <div id="app">Hello World</div>
    // text 为 Hello World， 它的父级则是 id='app'的 DOM节点，也就是 currentEle
    text = text.trim()
    if (text) {
      currentEle.children.push({
        type: 3,
        text,
        parent: currentEle
      })
    }
  }
  return root
}

// 1、通过 parseHtml 解析出开始标签、属性、结束标签、文本等，分别传给对应的处理函数中
// 2、目前解析好的标签，并没有形成树的结构，也就是没有绑定父子关系，