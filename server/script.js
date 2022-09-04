$(document).ready(() => {
    $('#loginform').submit((e)=>{
        e.preventDefault();
        ajaxPost();
    })
})

function ajaxPost(){
    var formData = {
        email: $('#email').val(),
        upwd: $('#upwd').val()
    }
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: window.location + 'api/login',
        data: JSON.stringify(formData),
        dataType: 'json',
        success: (customer) => {
            if(customer.valid == true){
                $('#loginform').removeClass('fail');
                $('#loginform').addClass('success');
            } else {
                $('#loginform').removeClass('success');
                $('#loginform').addClass('fail');
            }
            console.log('POSTed successfully');
        },
        error: () => {
            alert("Error!");
            console.log('Error: ', e);
        }
    })
}

function resetData(){
    $('#email').val('');
    $('#upwd').val('');
    
}