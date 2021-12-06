


function getValue() {

  var isChecked_bread_top = document.getElementById('bread_top').checked;
  var bread_top = isChecked_bread_top ? true : false;
  console.log("bread_top" + bread_top)
  
  var isChecked_lettuce = document.getElementById('lettuce').checked;
  var lettuce = isChecked_lettuce ? true : false;
  console.log("lettuce" +lettuce)

  var isChecked_bacon = document.getElementById('bacon').checked;
  var bacon = isChecked_bacon ? true : false;
  console.log("bacon" +bacon)

  var isChecked_cheese = document.getElementById('cheese').checked;
  var cheese = isChecked_cheese ? true : false;
  console.log("cheese" +cheese)

  var isChecked_meat = document.getElementById('meat').checked;
  var meat = isChecked_meat ? true : false;
  console.log("meat" +meat)


  var isChecked_bread_bottom = document.getElementById('bread_bottom').checked;
  var bread_bottom = isChecked_bread_bottom ? true : false;
  console.log("bread_bottom" +bread_bottom)

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


function getValue_item(x) {
 
  console.log("_____" + x)
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


  // form.addEventListener("submit", (event) => {
  //   event.preventDefault();



  // });