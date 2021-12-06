


function getValue() {

  var isChecked_bread_top = document.getElementById('bread_top').checked;
  var bread_top = isChecked_bread_top ? true : false;
  
  var isChecked_lettuce = document.getElementById('lettuce').checked;
  var lettuce = isChecked_lettuce ? true : false;

  var isChecked_bacon = document.getElementById('bacon').checked;
  var bacon = isChecked_bacon ? true : false;

  var isChecked_cheese = document.getElementById('cheese').checked;
  var cheese = isChecked_cheese ? true : false;

  var isChecked_meat = document.getElementById('meat').checked;
  var meat = isChecked_meat ? true : false;

  var isChecked_bread_bottom = document.getElementById('bread_bottom').checked;
  var bread_bottom = isChecked_bread_bottom ? true : false;

  if(bread_top) {
    $("#bread_top_css").show();
  } else {
    $("#bread_top_css").hide();
  }

  if(lettuce) {
    $("#lettuce_css").show();
  } else {
    $("#lettuce_css").hide();
  }

  if(bacon) {
    $("#bacon_css").show();
  } else {
    $("#bacon_css").hide();
  }

  if(cheese) {
    $("#cheese_css").show();
  } else {
    $("#cheese_css").hide();
  }

  if(meat) {
    $("#meat_css").show();
  } else {
    $("#meat_css").hide();
  }

  if(bread_bottom) {
    $("#bread_bottom_css").show();
  } else {
    $("#bread_bottom_css").hide();
  }
  
  //do something with that value
}

function myFunction() {
  var checkBox = document.getElementById("myCheck");
  var text = document.getElementById("text");
  if (checkBox.checked == true){
    text.style.display = "block";
  } else {
     text.style.display = "none";
  }
}

$('.cart').click(function(){
    alert("The cart button was clicked.");
  });

