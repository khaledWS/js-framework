$(document).on('click', '#changeNotificationRead', function (e) {
    e.preventDefault();
    let url = $(this).attr('href');
    $.ajax({
      url: url,
      method: 'post',
      beforeSend: function () {

      },
      success: function (data) {
        if (data.status == true) {
          $('#notificationsUnReadCount').hide();
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(errorThrown);
      }
    })
  });
  function prePendNotification(notification){
    $.ajax({
      url: getUserByIdRUL+'/'+notification.user_send_id+'?'+Math.random(),
      method: 'get',
      beforeSend: function () {

      },
      success: function (data) {
         if (data.status == true) {
           let url="#";
          if(notification.url){
            url = notification.url +'?notify_id='+notification.id;
          }
          let html= `<li style="background: #f9f9f9b8;"> 
                <a href="${url}">
                    <div class="drop_avatar">
                        <img  src="${data.user.image}" alt="">
                    </div>
                    <div class="drop_content">
                        <strong>  ${data.user.name} </strong> <span class="time">    1 دقيقة  </span> 
                        <p>  ${notification.body} </p>
                    </div>
                </a>
            </li>`

          $('.notifications_list .simplebar-content').prepend(html);
          $('#notificationsUnReadCount').text(data.notificationCenter);
           toastr.info(notification.body,data.user.name)
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(errorThrown);
      }
    })
  }


  
  let readAllMessages = function(e) {
    e.preventDefault();
   let url = $(this).data('url');
   $.ajax({
     url: url,
     method: 'POST',
     beforeSend: function () {

     },
     success: function (data) {
       if (data.status == true) {
         $('#messaagesUnReadCount').hide();

       }
     },
     error: function (jqXHR, textStatus, errorThrown) {
       console.log(jqXHR);
       console.log(errorThrown);
     }
   })
 };

 bindEvents([
 {
   element: '[event-listener="readAllMessages"]',
   event: "click",
   action: readAllMessages,
 },

])
  
 