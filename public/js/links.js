$(document).ready(function(){
    $('#links').on('click', '#btn-add', function(evt){
      var params = {};
      $('#new-link input[type=text]').each(function(idx, item){
        if (item.value!=="" && item.value!="null"){
          params[item._id] = item.value;
        }
      });
      if ($('#new-link #id').val()){
        params._id = $('#new-link #id').val();
        return editlink(params);
      }
      else{
        return newlink(params);
      }
    });
    $('#links').on('click', '.btn-del',function(evt){
      deletelink($(evt.currentTarget).attr('data-id'));
    });

    $('#links').on('click', '.btn-edit', function(evt){
      //editlink($(evt.currentTarget).attr('data-id'));
      //feed 'new' form with this link info
      var $newlink = $('#new-link');
      var $current = $(evt.currentTarget.parentNode.parentNode);
      
      $('#id', $newlink).val($(evt.currentTarget).attr('data-id'));
      $('#code', $newlink).val($('.code',$current).text());
      $('#url', $newlink).val($('.url',$current).text());
      
      $('#new-link #btn-add').text('Update');

    });
    $('#links').on('click', '#btn-cancel', function(evt){
      reset();
    });
  });

  $(document).on('keypress', 'input[type=text]', function(evt){
    if (evt.keyCode==13){
      $('#btn-add').click();
    }
  });

  
  function reset(){
    $('#new-link input[type=text]').val('');
    $('#new-link input[type=hidden]').val('');
    $('#new-link #btn-add').text('Add');
  }
  function refresh(){
    $.ajax({type:'GET', url:'/links', dataType:'json', success:function(result){
      $('tbody tr.link').remove();
      result.forEach(function(item, idx){
        $('tbody').append(linkTpl(item, result.length-idx));
      });

    }, error:function(err){
        error(err);
        if (err.status == 404){
          $('tbody tr.link').remove();
      }
    }});
  }
  function linkTpl(link, index){
    if (!link){
      return "";
    }
   return "<tr class='link'><td>"+link.team+"</td><td class='number'>"+link.number+"</td><td class='lastname'>"+link.lastname+"</td><td class='firstname'>"+link.firstname+"</td><td class='position'>"+link.position+"</td><td class='club'>"+link.club+"</td><td class='image'>"+(link.image ? "<img src='"+link.image.contentURL+"' />" :'')+"</td><td class='buttons'><button class='btn-del' data-id='"+link.id+"'>Delete</button>&nbsp;<button class='btn-edit' data-id='"+link.id+"'>Edit</button></td></tr>";
  }
  function newlink(params){
  $.ajax({type:'POST', url:'/links', data:params, dataType:'json', success:function(result){
      success('Success - link id : '+result._id);
      refresh();
    }, error:function(err){
      error(err.msg);
    }
  });
}
function deletelink(id){
  $.ajax({type:'DELETE', url:'/links/'+id, dataType:'json', success:function(result){
      success('Success - '+result.msg);
      refresh();
    }, error:function(err){
      error(err.msg);
    }
  });
}
function editlink(params){
  $.ajax({type:'PUT', url:'/links/'+params._id, data:params,dataType:'json', success:function(result){
    success('Edit link '+result._id);
    refresh();
  }});
}