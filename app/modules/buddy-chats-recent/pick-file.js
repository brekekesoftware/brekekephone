import React from 'react'

export default function pickFile (onFile) {
    //const input = React.createElement('input',{type:'file'} );
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = function () {
        onFile(this.files[0]);
    }
    input.click();
}
