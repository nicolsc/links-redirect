 
  function success(msg){
    $('#result').removeClass('error').addClass('success').html(msg).show().fadeOut(3000);
    reset();
  }
  function error(err){
    var msg = '';
    if (typeof err == 'string'){
      msg = err;
    }
    else{
      msg = 'Error  '+err.status+' '+err.statusText;
    }
    $('#result').addClass('error').removeClass('success').html(msg).show().fadeOut(3000);
  }