export class controller{
    constructor(model, view){
        this.model = model
        this.view = view
            this.view.extractItem(model.state)

        this.view.on('event:send-data', this.showDataBase.bind(this))
        this.view.on('event:create', this.addTask.bind(this))
        this.view.on('event:removetask', this.removeTask.bind(this))
        this.view.on('event:remove-all', this.removeAllTask.bind(this))
    }
    addTask(data){
        const task = {
            id: Date.now(),
        } 

        this.model.addInState(task);
        this.view.addItem(task)
    }
    removeTask(id){
        this.view.removeItem(id)
        this.model.removeItem(id)
    }
    removeAllTask(data){
        this.model.removeAllItem()
        this.view.removeAllItem()
    }
    showDataBase(data){
        console.log(data)
    }
}