
export class View{
    constructor(){
        
        this.menu_btn = document.querySelector('.slyxFdN')
        this.menu = document.querySelector('ui-menu-layout')
        this.overlay = document.querySelector('ui-overlay')

        this._listeners()

    }
    _openmenu(){
        this.menu.removeAttribute('hidden')
        this.overlay.removeAttribute('hidden')
    }
    _closemenu(overlay){
        this.menu.setAttribute('hidden', '')
        this.overlay.setAttribute('hidden', '')
    }
    _listeners(){
       this.menu_btn.addEventListener('click', () =>{ this._openmenu()})
       this.overlay.addEventListener('mousedown', () =>{ this._closemenu()})
    }
}