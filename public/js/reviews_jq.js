(function ($) {
  
  $("#reviewErr").empty();
  let restaurantId = document.getElementById('restaurantId').value;

  //Listen for all forms 
  $("*").submit(function (event) {
    //event.preventDefault();  //only prevent default action if pressing like/dislike button
    var currentLink = $(this);
    //Pulls the context of this object, grabs the form html and parses the id out of it 
    var mydata = currentLink.context.outerHTML.toString().split(" ")[2];
    var formId = mydata.substring(4, 32);
    
    if (formId.length == 28) {
      event.preventDefault();
      //now we can pull the specific form with the proper ID
      var postId = formId.substring(0, 3);
      var reviewId = formId.substring(4, 28);
    
      let like = false;
      let dislike = false;

      var myForm = $(`#${formId}`);
      if (postId == "LB1") { //This is a add_like
        var postType = $(`#postType1_${reviewId}`).val();
        like = true;
      } else if (postId == "LB2") {  //This is a remove_like
        var postType = $(`#postType2_${reviewId}`).val();
        like = true;
      } else if (postId == "DB1") {  //This is an add_dislike
        var postType = $(`#postType3_${reviewId}`).val();
        dislike = true;
      } else {                      //Else, we have a remove_dislike
        var postType = $(`#postType4_${reviewId}`).val();
        dislike = true;
      }

      var requestConfig = {
        method: 'POST',
        url: `/restaurants/${restaurantId}/reviews`,
        contentType: 'application/json',
        data: JSON.stringify({
          postType: postType,
          likeId: reviewId
        })
      }
      
      if (like) {
        $.ajax(requestConfig).then(function (response) {
          var newElement = $(response);
          var update = document.getElementById(`likePartial_${reviewId}`);
          $(update).empty();
          $(update).append(newElement);

        }, function (error) {
          var msg = error.responseText;
          alert(msg);
        });

      } else if (dislike) {

        $.ajax(requestConfig).then(function (response) {
          var newElement = $(response);
          var update = document.getElementById(`dislikePartial_${reviewId}`);
          $(update).empty();
          $(update).append(newElement);

        }, function (error) {
          var msg = error.responseText;
          alert(msg)
        });
      }
    } else {
      var reviewForm = document.getElementById("New_Review");
      if (reviewForm) {
        var myFile = document.getElementById("photo").files[0].name;
        var extension = myFile.split(".")[1];
        if (extension !== "png" || extension !== "jpeg" || extension !== "jpg") {
          $("#reviewErr").empty();
          $("#reviewErr").append('<h2 id="errMsg">Image submission is optional, but file must be png, jpeg, or jpg format</h2>');
          event.preventDefault();
        }
       }
    }
  })


})(window.jQuery);