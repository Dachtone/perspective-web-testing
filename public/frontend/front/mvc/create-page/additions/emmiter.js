export class eventEmmiter{
    constructor(){
        this.state = {}
    }
    // метод @on подписывает $callback-функию на событие $type
    on(type, callback){
        this.state[type] ? this.state[type] = this.state[type] : this.state[type] = []
        this.state[type].push(callback)
    }
    // метод @init вызывает $callback-функцию с аргументом $data по подписанному событию $type
    init(type, data){
        const event = this.state[type]
        if(event){
            Array.prototype.forEach.call(event, listener => listener(data))
        }else{
            console.error('error: init not recognized event')
        }
    }
}