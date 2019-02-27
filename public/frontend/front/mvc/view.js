
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
    _menu_switcher(){
        if(this.menu.getAttribute('ctrl-state') == 'false'){
            this.menu.setAttribute('ctrl-state', 'true')

            this._openmenu()
        }else if(this.menu.getAttribute('ctrl-state') == 'true'){
            this.menu.setAttribute('ctrl-state', 'false')

            this._closemenu()
        }
    }
    _listeners(){
       this.menu_btn.addEventListener('click', () =>{ this._openmenu()})
       this.overlay.addEventListener('mousedown', () =>{ this._closemenu()})
       document.addEventListener('keyup', (e)=>{
           e.keyCode == 17 ? this._menu_switcher() : 0
       })
    }
}