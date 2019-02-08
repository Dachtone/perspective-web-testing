import {eventEmmiter} from './additions/emmiter.js'

export class model extends eventEmmiter {
    constructor(state = []){
        super()
        
        this.state = state
    }
    addInState(data){
        this.state.push(data)
        this.init('event:record', this.state)
    }
    removeItem(id){
        const element = this.state.findIndex(item => item.id == id)

        if(element > -1){
            this.state.splice(element, 1)
            this.init('event:record', this.state)
        }
    }
    removeAllItem(){
        this.state.length = 0
        this.init('event:record', this.state)
    }

}