import {view} from './view.js'
import {controller} from './controller.js'
import {model} from './model.js'

function saveData(data){
    const record = JSON.stringify(data)
    
    window.sessionStorage.setItem('record_dataCreate', record)
}
function parseRecord(data){
    const record = window.sessionStorage.getItem(data)

    return JSON.parse(record)
}



let _appView = new view()
let _appModel = new model(parseRecord('record_dataCreate') || undefined)

_appModel.on('event:record', saveData)
new controller(_appModel, _appView)