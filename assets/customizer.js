(() => {
  let $container = $('#cz-customizer-container'),
      format = $container.data('format'),
      size = $container.data('size'),
      color = $container.data('color'),
      product = $container.data('product'),
      defaultDesign = $container.data('default-design'),
      qProofId = new URLSearchParams(window.location.search).get('proof_id'),
      attrs;
  const DATA_ITEMS = ['first', 'last', 'birth_date', 'death_date', 'epitaph', 'first2', 'birth_date2', 'death_date2', 'married_date'];

  function populateUserFields(data) {
    DATA_ITEMS.forEach(item => {
      if (item.match(/date/)) {
        let parts = data[item].split('-');
        $(`#cz-${item}-year`).val(parts[0]);
        $(`#cz-${item}-month`).val(parseInt(parts[1]));
        $(`#cz-${item}-day`).val(parseInt(parts[2]));
      } else {
        $(`#cz-${item}`).val(data[item]);
      }
    });
    defaultDesign = data.code;
  }

  function initCustomizer(data) {
    console.log('initCustomizer');
    console.log(data);
    let blanks = data.blanks[format][color][size];
    console.log({blanks});
    if (!blanks) {
      alert(`No customization data were found for this combination: ${format} / ${color} / ${size}`);
      return;
    }
    let $designSelectorContainer = $('<div>').addClass('grid__item cz-design-selector'),
        catNames = Object.keys(blanks),
        $catSelectors = $('<div>').addClass('cz-cat-selector-container'),
        $defaultCat = null, $defaultThumb = null;
        console.log({catNames});
    $designSelectorContainer.append($catSelectors);
    for (let i = 0; i < catNames.length; i++) {
      let $catContainer = $('<div>').addClass('cz-cat-container hide').attr('id', `cz-cat-${catNames[i]}`),
          $btn = $('<div>').addClass('cz-cat-selector').text(catNames[i]).data('cz-cat-name', catNames[i]),
          thumbs = blanks[catNames[i]],
          mediumNames = Object.keys(thumbs);
          console.log({mediumNames});
      $catSelectors.append($btn);
      for (let j = 0; j < mediumNames.length; j++) {
        $catContainer.append($('<label>').addClass('cz-medium').text(mediumNames[j]));
        thumbs[mediumNames[j]].forEach(blank => {
          let design = data.designs[blank.code],
              $img = $('<img>').addClass('cz-thumb').attr('src', design.image).data('attrs', { image: blank.image, design: design });
          if (blank.code == defaultDesign) { $defaultCat = $btn; $defaultThumb = $img; }
          $catContainer.append($img);
        });
      }
      $designSelectorContainer.append($catContainer);
    }
    $('#customizerFieldsWrapper').before($designSelectorContainer);
    //$container.append($designSelectorContainer);
    $('.product-single').addClass('hide');
    $container.removeClass('hide').addClass('customizer-loaded');
    if ($defaultThumb) {
      $defaultCat.trigger('click', ['skipThumb']);
      $defaultThumb.trigger('click', ['skipScroll']);
    } else {
      $catSelectors.children().eq(0).trigger('click');
    }
    $('.cz-month-selector').each((i, el) => adjustDaysInMonth({ target: el }));
  }

  function clearThumbs() {
    $('.cz-design-selector').remove();
  }

  function setupCategory(e, skipThumb) {
    e.stopPropagation();
    let $target = $(e.target),
        $catContainer = $(`#cz-cat-${$target.data('cz-cat-name')}`);
    $('.cz-cat-container').addClass('hide');
    $catContainer.removeClass('hide');
    if (!skipThumb)
      $catContainer.find('.cz-thumb').eq(0).trigger('click', ['skipScroll']);
  }

  function setupBlank(e, skipScroll) {
    e.stopPropagation();
    let $target = $(e.target);
    attrs = $target.data('attrs');
    $('#cz-blank').attr('src', attrs.image);
    DATA_ITEMS.forEach(item => {
      $(`#cz-text-${item}`).css({
        top: `${attrs.design[`${item}_y`]}%`,
        marginLeft: `${attrs.design[`${item}_x`] - 50}%`
      });
      let selector = item.match(/date/) ? `#cz-${item}-month` : `#cz-${item}`;
      $(selector).each((i, el) => updateText({ target: el }));
    });
    $('#cz-text-last').css({
      fontSize: `${attrs.design.last_name_size}px`,
      color: fontColor(attrs.design.last_name_frosted)
    });
    $('#cz-text-first,#cz-text-first2').css({
      fontSize: `${attrs.design.first_name_size}px`,
      color: fontColor(attrs.design.first_name_frosted)
    });
    $('.cz-text-date').css({
      fontSize: `${attrs.design.date_size}px`,
      color: fontColor(attrs.design.date_frosted)
    });
    $('.cz-text-married-date').css({
      fontSize: `${attrs.design.married_size}px`,
      color: fontColor(attrs.design.married_frosted)
    });
    ['', '2'].forEach(group => {
      $(`#cz-text-date_separator${group}`).css({
        top: `${(attrs.design[`birth_date${group}_y`] + attrs.design[`death_date${group}_y`]) / 2}%`,
        marginLeft: `${(attrs.design[`birth_date${group}_x`] + attrs.design[`death_date${group}_x`]) / 2 - 50}%`,
        fontSize: `${attrs.design.date_size}px`,
        color: fontColor(attrs.design.date_frosted)
      }).text(attrs.design.date_separator);
    });
    switch (attrs.design.date_format) {
      case 'two-line':
        $('.cz-text-date').addClass('cz-text-two-line');
        $('.cz-month-selector,.cz-day-selector').removeClass('hide');
        break;
      case 'one-line':
        $('.cz-text-date').removeClass('cz-text-two-line');
        $('.cz-month-selector,.cz-day-selector').removeClass('hide');
        break;
      default:
        $('.cz-text-date').removeClass('cz-text-two-line');
        $('.cz-month-selector:not(.cz-married-element),.cz-day-selector:not(.cz-married-element)').addClass('hide');
    }
    switch (attrs.design.married_format) {
      case 'two-line':
        $('.cz-text-married-date').addClass('cz-text-two-line');
        $('.cz-married-element').removeClass('hide');
        break;
      case 'one-line':
        $('.cz-text-married-date').removeClass('cz-text-two-line');
        $('.cz-married-element').removeClass('hide');
        break;
      default:
       $('.cz-married-element').addClass('hide');
    }
    if (attrs.design.epitaph) {
      $('.cz-text-epitaph').css({
        fontSize: `${attrs.design.epitaph_size}px`,
        color: fontColor(attrs.design.epitaph_frosted)
      });
      $('.cz-epitaph-element').removeClass('hide');
    } else {
      $('.cz-epitaph-element').addClass('hide');
    }
    if (!skipScroll)
      $([document.documentElement, document.body]).animate({ scrollTop: $("#cz-customizer-container").offset().top }, 500);
  }

  function formatDate(date_format, $parent) {
    if ('year-only' == date_format) return $parent.find('.cz-year-selector').val();
    let day = $parent.find('.cz-day-selector').val(),
        sep = 'two-line' == date_format ? '<br>' : '' == day ? '' : ', ';
    return `${$parent.find('.cz-month-selector option:selected').text()} ${day}${sep}${$parent.find('.cz-year-selector').val()}`;
  }

  function formatMarriedDate(date_format, $parent) {
    return `Married<br>${formatDate(date_format, $parent)}`;
  }

  function fontColor(frosted) {
    return frosted || 'gray' == color ? 'black' : 'white';
  }

  function updateText(e) {
    let $target = $(e.target),
        field = $target.data('field'),
        $text = $(`#cz-text-${field}`);
    if (field.match(/married/)) {
      $text.html(formatMarriedDate(attrs.design.married_format, $target.parent()));
    } else if (field.match(/date/)) {
      $text.html(formatDate(attrs.design.date_format, $target.parent()));
    } else if (field.match(/epitaph/)) {
      let $ep = $('#cz-epitaph'),
          $ep1 = $('#cz-epitaph2'),
          twoLine = $ep1.val() != '';
      $text.html(`${$ep.val()}${twoLine ? `<br>${$ep1.val()}` : ''}`);
      if (twoLine) {
        $text.addClass('cz-text-two-line');
      } else {
        $text.removeClass('cz-text-two-line');
      }
    } else {
      $text.html($target.val());
    }
  }

  function adjustDaysInMonth(e) {
    let $parent = $(e.target).parent(),
        month = $parent.find('.cz-month-selector').val(),
        year = parseInt($parent.find('.cz-year-selector').val()),
        $daySelector = $parent.find('.cz-day-selector'),
        $lastDay = $daySelector.children().last(),
        days = 31;
    if (2 == month) {
      days = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) ? 29 : 28;
    } else if ((month - (month > 7 ? 1 : 0)) % 2 == 0) {
      days = 30;
    }
    while (parseInt($lastDay.val()) > days) {
      $lastDay.remove();
      $lastDay = $daySelector.children().last();
    }
    while (parseInt($lastDay.val()) < days) {
      $lastDay = $('<option>').text(parseInt($lastDay.val()) + 1);
      $daySelector.append($lastDay);
    }
  }

  function finalizeProofNew(data) {
    console.log(data);
    $('.product-form__submit-disabled').removeClass('product-form__submit-disabled');
    $('#cz-proof-id').val(data);
    let proofId = $('#cz-proof-id').val();
    var shareUrl = `https://customizer.headstonedirect.com/api/proof/${data}/${product}`;
    $('#cz-share-design').removeClass('product-form__share-disabled').attr('href',shareUrl);
    replaceProductImage(data);
  }
  $('#cz-share-design').on('click',function(e){
    
    e.preventDefault();
    var shareUrl = $(this).attr('href');
    const after = shareUrl.substring(shareUrl.indexOf('proof/') + 6);
    console.log(shareUrl);
    console.log(after);
    var iframeUrl = "https://customizer.headstonedirect.com/api/checkout/" + after;
    console.log(iframeUrl);
    navigator.clipboard.writeText(shareUrl);
    $('#shareUrl').text(shareUrl);
    var iframeProof = `<iframe id="previewIframe" src="${iframeUrl}" class="cz-checkout"></iframe> `;
    $('#shareModal').append(iframeProof).addClass('show');
    //alert('Share this URL: ' + shareUrl);
  });
  $('#closeShareModal').on('click',function(){
    $('#shareModal').removeClass('show');
    $('#previewIframe').remove();
  });

  function finalizeProof(data) {
    $('#cz-proof-id').val(data);
    replaceProductImage(data);
    $('.product-form__controls-group--submit').removeClass('hide');
    $('.product-single').removeClass('hide');
    $container.addClass('hide');
  }

  function replaceProductImage(proofId) {
    let $iframe = $('<iframe>')
      .attr('src', `https://customizer.headstonedirect.com/api/checkout/${proofId}/${product}`)
      .addClass('cz-checkout product-single__media-wrapper');
    $('.product-single__media-wrapper').replaceWith($iframe);
  }

  function assembleDate(field) {
    if ('family' == format) return null;
    if ('individual' == format && ['birth_date2', 'death_date2', 'married_date'].includes(field)) return null;
    if ('companion' == format && 'married_date' == field && '' == attrs.design.married_format) return null;
    let year = $(`#cz-${field}-year`).val(),
        year_only = 'year-only' == attrs.design.date_format,
        month = year_only ? '01' : $(`#cz-${field}-month`).val(),
        day = year_only ? '01' : $(`#cz-${field}-day`).val();
    return `${year}-${month}-${day}`;
  }

  $('#cz-customizer-panel').addClass(`cz-color-${color}`);
  if ('individual' == format) {
    $container.find('.cz-double-field').remove();
  } else if ('family' == format) {
    $container.find('.cz-single-field,.cz-double-field').remove();
  }
  $('#cz-customize-button').on('click', (e) => {
    e.stopPropagation();
    $.ajax({
      url: 'https://customizer.headstonedirect.com/api/feed',
      dataType: 'json',
      success: initCustomizer,
      error: (e) => alert(`Unexpected error retrieving designs data: ${e.state()} (1)`) 
    });
  });
  


  $('#cz-finalize-button').on('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    $.ajax({
      url: 'https://customizer.headstonedirect.com/api/proof',
      method: 'POST',
      dataType: 'text',
      contentType: 'application/json',
      data: JSON.stringify({
        first: $('#cz-first').val(),
        first2: $('#cz-first2').val(),
        last: $('#cz-last').val(),
        birth_date: assembleDate('birth_date'),
        death_date: assembleDate('death_date'),
        birth_date2: assembleDate('birth_date2'),
        death_date2: assembleDate('death_date2'),
        married_date: assembleDate('married_date'),
        epitaph: $('#cz-epitaph').val(),
        epitaph2: $('#cz-epitaph2').val(),
        design_id: attrs.design.id,
        color: color,
        size: size,
        product: product
      }),
      success: finalizeProofNew,
      error: (e) => alert(`Unexpected error posting proof: ${e.state()}`)
    });
  });
  
  $('#cz-done-button').on('click', (e) => {
    e.stopPropagation();
    $.ajax({
      url: 'https://customizer.headstonedirect.com/api/proof',
      method: 'POST',
      dataType: 'text',
      contentType: 'application/json',
      data: JSON.stringify({
        first: $('#cz-first').val(),
        first2: $('#cz-first2').val(),
        last: $('#cz-last').val(),
        birth_date: assembleDate('birth_date'),
        death_date: assembleDate('death_date'),
        birth_date2: assembleDate('birth_date2'),
        death_date2: assembleDate('death_date2'),
        married_date: assembleDate('married_date'),
        epitaph: $('#cz-epitaph').val(),
        epitaph2: $('#cz-epitaph2').val(),
        design_id: attrs.design.id,
        color: color,
        size: size,
        product: product
      }),
      success: finalizeProof,
      error: (e) => alert(`Unexpected error posting proof: ${e.state()}`)
    });
  });
  $('#cz-cancel-button').on('click', (e) => {
    e.stopPropagation();
    clearThumbs();
    $('.product-single').removeClass('hide');
    $container.addClass('hide');
  });
  $('#cz-preview-button').on('click', (e) => {
    e.stopPropagation();
    let proofId = $('#cz-proof-id').val();
    if ('' == proofId) {
      alert('You must customize this product before viewing a proof'); return;
    }
    window.open(`https://customizer.headstonedirect.com/api/proof/${proofId}/${product}`);
  });
  $container.on('click', '.cz-cat-selector', setupCategory);
  $container.on('click', '.cz-thumb', setupBlank);
  $container.on('keyup change', '.cz-field', updateText);
  $container.on('change', '.cz-month-selector,.cz-year-selector', adjustDaysInMonth);
  $('form[action^="/cart/add"]').on('submit', (e) => {
    console.log('submit');
    e.stopPropagation();
    if ('' == $('#cz-proof-id').val()) {
      alert('You must customize the product before adding to the cart');
      return false;
    }
    return true;
  });

  if (qProofId) {
    $('#cz-proof-id').val(qProofId);
    replaceProductImage(qProofId);
    $.ajax({
      url: `https://customizer.headstonedirect.com/api/data/${qProofId}`,
      dataType: 'json',
      success: populateUserFields,
      error: (e) => alert(`Unexpected error retrieving proof data: ${e.state()} (2)`)
    });
  }


  $.ajax({
    url: 'https://customizer.headstonedirect.com/api/feed',
    dataType: 'json',
    success: initCustomizer,
    error: (e) => alert(`Unexpected error retrieving designs data: ${e.state()} (3)`)
  });

  
})();
