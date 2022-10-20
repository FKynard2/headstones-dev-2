$(document).ready(function(){
  var products_on_page = $('.products-on-pages').first();
  var next_url = products_on_page.data('next-url');
  
  // setTimeout(() => {
  //   loadMoreProducts ();
  // }, 5000);

  $('.load-more__btn').on('click',function(){
    loadMoreProducts();
  });
  
  function loadMoreProducts () {
    
      $.ajax(
          {
            url: next_url,
            type:'GET',
            dataType:'html'
          }
        ).done(
          function(next_page) {
            
            var new_products = $(next_page).find('.products-on-pages');
            var new_url = new_products.data('next-url');
            
            next_url = new_url;
            
            products_on_page.append(new_products.html());
          
          }
        );
  }

//   $(window).on("resize", function (e) {
//     checkScreenSize();
// });

// checkScreenSize();

// function checkScreenSize(){
//     var newWindowWidth = $(window).width();
//     if (newWindowWidth < 481) {
//       $(".footer-block__heading").click(function(){
//         $(".footer-block__details-content").slideToggle();
//       });
//     }
// }


});