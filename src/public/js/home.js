$(document).ready(function () {
  let carousel_length;
  let productTemplate;
  let compiledProductTemplate;

  // Two Handlebars helpers, 'if_equals' and 'unless_any_equals', 
  // are registered to facilitate conditional rendering of elements.
  Handlebars.registerHelper('if_equals', function (arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper('unless_any_equals', function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    const options = arguments[arguments.length - 1];
    return args.some(arg => arg === args[0]) ? options.inverse(this) : options.fn(this);
  });

  // productTemplate generates the HTML for a single product.


  function updateCarouselItems() {
    fetchProducts();
    carousel_length = window.innerWidth <= 767 ? 1 : 4;
    if (carousel_length == 1) {
      productTemplate = `
        <div class="carousel-item {{#if isFirst}}active{{/if}}">
         <div class="d-flex flex-row flex-wrap">
          {{#each products}}
          <div class="col">
        <div class="card-wrapper">
          <div class="card mycard">
            <img src="{{image}}" alt="{{alt}}" class="d-block w-100 h-100">
            <div class="card-body mycardbody">
              <h4 class="card-title" style="font-weight: bold; font-size: medium;">{{name}}</h4>
              <p class="card-text" style="font-weight: lighter; font-size: smaller;">
                {{#if descriptionIsTooLong}}{{shortDescription}}...{{else}}{{description}}{{/if}}
              </p>
              <p class="card-text" style="font-weight: bold; margin:0%;">{{price}}€</p>
              <div class="product-sizes">
                <div class="product-sizes">
                  <div class="container">
                    <div class="row">
                      <div class="col">
                        <div class="d-flex justify-content-center">
                          {{#each availableSizes}}
                            {{#if_equals this 'sizexs'}}<button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">XS</button>{{/if_equals}}
                            {{#if_equals this 'sizes'}}<button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">S</button>{{/if_equals}}
                            {{#if_equals this 'sizem'}}<button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">M</button>{{/if_equals}}
                            {{#if_equals this 'sizel'}}<button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">L</button>{{/if_equals}}
                            {{#if_equals this 'sizexl'}}<button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">XL</button>{{/if_equals}}
                            {{#unless_any_equals this 'sizexs' 'sizes' 'sizem' 'sizel' 'sizexl'}}
                              <button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">{{this}}</button>
                            {{/unless_any_equals}}
                          {{/each}}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-center">    
              <button class="btn btn-outline-dark btn-add-cart" data-id="{{id}}" style="border-radius: 50rem;" data-name="{{name}}"
              data-image="{{image}}" data-alt="{{alt}}" data-price="{{price}}"  data-description="{{description}}" data-size="" disabled>Add to Cart</button>
              </div>
              </div>
          </div>
        </div>
      </div>
    {{/each}}
  </div>
              </div>`;
    }
    else {
      productTemplate = `
        <div class="carousel-item {{#if isFirst}}active{{/if}}">
         <div class="d-flex flex-row flex-wrap">
          {{#each products}}
          <div class="col-md-3">
        <div class="card-wrapper">
          <div class="card mycard">
            <img src="{{image}}" alt="{{alt}}" class="d-block w-100 h-100">
            <div class="card-body mycardbody">
              <h4 class="card-title" style="font-weight: bold; font-size: medium;">{{name}}</h4>
              <p class="card-text" style="font-weight: lighter; font-size: smaller;">
                {{#if descriptionIsTooLong}}{{shortDescription}}...{{else}}{{description}}{{/if}}
              </p>
              <p class="card-text" style="font-weight: bold; margin:0%;">{{price}}€</p>
              <div class="product-sizes">
                <div class="product-sizes">
                  <div class="container">
                    <div class="row">
                      <div class="col">
                        <div class="d-flex justify-content-center">
                          {{#each availableSizes}}
                            {{#if_equals this 'sizexs'}}<button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">XS</button>{{/if_equals}}
                            {{#if_equals this 'sizes'}}<button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">S</button>{{/if_equals}}
                            {{#if_equals this 'sizem'}}<button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">M</button>{{/if_equals}}
                            {{#if_equals this 'sizel'}}<button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">L</button>{{/if_equals}}
                            {{#if_equals this 'sizexl'}}<button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">XL</button>{{/if_equals}}
                            {{#unless_any_equals this 'sizexs' 'sizes' 'sizem' 'sizel' 'sizexl'}}
                              <button class="btn btn-light rounded-pill mx-1 size-btn" data-size="{{this}}">{{this}}</button>
                            {{/unless_any_equals}}
                          {{/each}}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-center">    
              <button class="btn btn-outline-dark btn-add-cart" data-id="{{id}}" style="border-radius: 50rem;" data-name="{{name}}"
              data-image="{{image}}" data-alt="{{alt}}" data-price="{{price}}"  data-description="{{description}}" data-size="" disabled>Add to Cart</button>
              </div>
              </div>
          </div>
        </div>
      </div>
    {{/each}}
  </div>
</div>`;
    }

    compiledProductTemplate = Handlebars.compile(productTemplate);
  }

  updateCarouselItems();


  // This Handlebars template generates the HTML structure for product cards in a carousel.
  function generateProductsHtml(data) {
    let productsHtml = '';
    const max_length_of_description = 40;

    for (let i = 0; i < data.length; i += carousel_length) {
      const products = data.slice(i, i + carousel_length).map(product => {
        const shortDescription = product.description.slice(0, max_length_of_description);
        const descriptionIsTooLong = product.description.length > max_length_of_description;

        const availableSizes = ['sizexs', 'sizes', 'sizem', 'sizel', 'sizexl'].filter(sizeKey => product[sizeKey] > 0);

        return { ...product, shortDescription, descriptionIsTooLong, availableSizes };
      });

      productsHtml += compiledProductTemplate({ isFirst: i === 0, products });
    }

    $('#product-list').html(productsHtml);

    $('#product-carousel').carousel({
      interval: false,
      wrap: false
    });

    $('.next-btn').click(function () {
      $('#product-carousel').carousel('next');
    });
    $('.prev-btn').click(function () {
      $('#product-carousel').carousel('prev');
    });

    function handleSizeBtnClick() {
      if ($(this).hasClass('selected')) {
        $(this).removeClass('selected');
        $(this).closest('.card-body').find('.btn-add-cart').attr('disabled', true).attr('data-size', '');
      } else {
        $(this).closest('.product-sizes').find('.size-btn').removeClass('selected');
        $(this).addClass('selected');
        const selectedSize = $(this).attr('data-size');
        $(this).removeClass('selected');
        $(this).closest('.card-body').find('.btn-add-cart').attr('disabled', false).attr('data-size', selectedSize);
      }
    }

    $('.size-btn').on('click', handleSizeBtnClick);
  }

  function fetchProducts() {
    $.ajax({
      url: '/fetch_products',
      method: 'GET',
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        generateProductsHtml(data);
      }
    });
  }

  function searchProducts(searchTerm) {
    $.ajax({
      url: '/search_products',
      method: 'GET',
      data: { query: searchTerm },
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      success: function (data) {
        if (data.length > 0) {
          generateProductsHtml(data);
        } else {
          $('#search-result').text("No results found");
          fetchProducts();
        }
      },
      error: function () {
        $('#product-list').html('');
        console.error('An error occurred while searching for products.');
      }
    });
  }

  fetchProducts();

  window.addEventListener("resize", updateCarouselItems);


  $('#search-btn').click(function () {
    $('#search-result').text('');
    const searchTerm = $('#search-input').val();
    if (searchTerm !== '') {
      searchProducts(searchTerm);
    } else {
      fetchProducts();
    }
  });

  $('#search-input').keypress(function (e) {
    if (e.which === 13) { // Enter key
      e.preventDefault();
      $('#search-btn').click();
    }
  });

  $('.size-btn').on('click', function () {
    $(this).toggleClass('size-btn-selected');

    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
    } else {
      $('.size-btn').removeClass('selected');
      $(this).addClass('selected');
    }
  });
});