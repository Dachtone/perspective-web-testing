export function createElement(tag,attr, ...child){
    const DOMelement = document.createElement(tag)
    for( let k in attr){
        DOMelement.setAttribute(k, attr[k])
    }
    Array.prototype.forEach.call(child, element =>{
        DOMelement.appendChild(element)
    })
    return DOMelement
    }