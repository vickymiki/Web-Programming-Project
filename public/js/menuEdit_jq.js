
  
$('#superburger').click(function(){
    $('#superburgerselected').show()
    $('#customArea').hide()
});

    $('#notsuperburger').click(function(){
    $('#superburgerselected').hide()
    $('#customArea').show()
});

function handleAddCustom(){
    if($('#customTextbox').val().trim() === ""){
        $('#error').show()
        return
    }

    $('#error').hide()
    let listLength = $('#customList')[0].children.length
    var newItem = $(`<li id="item${listLength}"">${$('#customTextbox').val().trim()}</li>`)
    $('#customList').append(newItem)
}

function handleDeleteCustom(){
    let listLength = $('#customList')[0].children.length
    if(listLength === 0) return

    $(`#item${listLength-1}`).remove()
}

function handleSubmit(){
    let customTemplate = '<input type = "text" name="customOptionArray[$x]" value="$y"/>'
    let num = 1

    $('#customList li').each(function(idx,li){
        console.log(li.innerHTML)
        let newItem = customTemplate.replace("$x", num)
        newItem = newItem.replace("$y", li.innerHTML)
        num += 1
        $('#menu-form').append(newItem)
    })
}

$('#menu-form').submit(function(event){
    if(event.originalEvent.submitter.id === 'submitButton'){
        handleSubmit()
        return
    }

    event.preventDefault()
    if(event.originalEvent.submitter.id === 'addCustomButton'){
        handleAddCustom()
    }

    if(event.originalEvent.submitter.id === 'deleteCustomButton'){
        handleDeleteCustom()
    }

});