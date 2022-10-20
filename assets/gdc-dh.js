$(document).ready(function() {

  $('.add2cart__collection--button').on('click', function(evt) {
    evt.preventDefault();
    var $addToCartBtn = $(this),
      $addToCartForm = $(this).closest('form'),
      $addToCartText = $(this).find('span');
    if ($addToCartForm.length) {
      $addToCartBtn
        .data('add-to-cart', $addToCartText.text())
        .prop('disabled', true)
        .addClass('btn--ajax-disabled');
      $.ajax({
        url: '/cart/add.js',
        dataType: 'json',
        type: 'post',
        data: $addToCartForm.serialize(),
        success: function() {
          console.log('added it');
          $('#cart-notification').addClass('active');
        },
        error: function(XMLHttpRequest) {
          console.log('error');
        }
      });
    }
  });

  $('.footer-block__heading').on('click',function(){
    var parentBlock = $(this).closest('.footer-block');
    parentBlock.toggleClass('mobile-expanded')
    if ( $(this).hasClass('footer-block__heading-contact') ) {
      var nextBlock = parentBlock.next();
      nextBlock.toggleClass('mobile-expanded');
    }
  });
});