var cart = [];

$(document).ready(function () {
    var totalPrice = 0;
    function insertNewlineEveryNChars(str) {
        /*let result = '';
        for (let i = 0; i < str.length; i++) {
          if (i > 0 && i % 20 === 0) {
            result += '\n';
          }
          result += str.charAt(i);
        }*/
        return str;
    }

    function updateCart() {
        var cartItemsHtml = "";
        totalPrice = 0;

        cart.forEach(function (item) {
            let descr;
            if (item.description.length >= 30) {
                descr = item.description.slice(0, 20) + "...";
            } else {
                descr = item.description;
            }
            let the_size;
            switch (item.size) {
                case 'sizexs':
                    the_size = 'XS'
                    break;
                case 'sizes':
                    the_size = 'S'
                    break;
                case 'sizem':
                    the_size = 'M'
                    break;
                case 'sizel':
                    the_size = 'L'
                    break;
                case 'sizexl':
                    the_size = 'XL'
                    break;


            }
            cartItemsHtml += `
  <div class="list-group-item d-flex justify-content-between align-items-center" style="border:0">
    <div class="flex-container">
      <img src="${item.image}" alt="${item.alt}" class="img-thumbnail" style="width: 60px; height: 70px; padding:0%;border: 0%; box-sizing: none; flex: 0 0 25%; width: 100%; height: auto;">
      <div class="ml-2">
        <div style="font-weight: bold;">${item.name}</div>
        <div style="font-weight: bold;">${the_size}</div>
        <div style="font-size: x-small ; font-weight: lighter">${insertNewlineEveryNChars(descr)}</div>
      </div>
      <div class="d-flex">
        <button class="quantity-selector-minus" style="width: 24px; height: 24px; padding: 0%; border: none; background-color: #E3E7E8; border-radius: 50%; display: flex; align-items: center; justify-content: center;">-</button>
        <div class="count text-center ml-2 mr-2">${item.quantity}</div>
        <button class="quantity-selector-plus" style="width: 24px; height: 24px; padding: 0%; border: none; background-color: #E3E7E8; border-radius: 50%; display: flex; align-items: center; justify-content: center;">+</button>
      </div>
      <div>${item.price}€</div>
    </div>
  </div>`;

            totalPrice += item.price * item.quantity;
        });

        $('#cart-items').html(cartItemsHtml);
        $('#total-price').text(totalPrice.toFixed(2));
        $('.cart-item-count').text(cart.length > 0 ? cart.length : '').show();
    }

    function updateCartCountBadge() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCount > 0) {
            $('.cart-link').html(`CART <span class="badge badge-danger">${cartCount}</span>`);
        } else {
            $('.cart-link').html('CART');
        }
    }

    function enableAddToCartButton(itemID) {
        var addButton = $(`.btn-add-cart[data-id="${itemID}"]`);
        var removeButton = $(`.btn-remove-cart[data-id="${itemID}"]`);
        addButton.text('Add to Cart');
        addButton.removeAttr('disabled');
        removeButton.addClass('d-none');
    }

    function addToCart(item) {
        var existingItem = cart.find(function (cartItem) {
            return cartItem.id === item.id && cartItem.size === item.size;
        });

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        var removeButton = $(`.btn-remove-cart[data-id="${item.id}"]`);
        removeButton.removeClass('d-none');

        updateCart();
        updateCartCountBadge();
    }

    function showCart() {
        $('.cart-overlay').addClass('d-block');
        $('.cart-container').addClass('d-block');
        $('body').addClass('overflow-hidden');
    }

    function hideCart() {
        $('.cart-overlay').removeClass('d-block');
        $('.cart-container').removeClass('d-block');
        $('body').removeClass('overflow-hidden');
    }

    $(document).on('click', '.btn-add-cart', function () {
        const selectedSize = $(this).attr('data-size');

        var item = {
            id: $(this).data('id'),
            name: $(this).data('name'),
            image: $(this).data('image'),
            alt: $(this).data('alt'),
            price: $(this).data('price'),
            size: selectedSize,
            description: $(this).data('description')
        };

        addToCart(item);

        $(this).text('Add to Cart');
        $(this).attr('disabled', true);
        $(this).next().show();
    });

    $(document).on('click', '.remove-from-cart', function () {
        const itemID = $(this).data('id');
        const itemIndex = cart.findIndex(item => item.id === itemID);

        if (itemIndex > -1) {
            cart.splice(itemIndex, 1);
            updateCart();
            updateCartCountBadge();
            $(this).hide(); // Hide the 'remove from cart' label
            enableAddToCartButton(itemID);
        }
    });

    $('#keep-shopping-btn').click(function () {
        hideCart();
    });

    $('#pay-btn').click(function () {
        const cartItems = cart || [];
        if (cartItems.length > 0) {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            updateCart();
            hideCart();
            window.location.href = 'form.html';
        } else {
            alert("Your cart is empty!");
        }
    });


    $(document).on('click', '.quantity-selector-plus', function () {
        var index = $(this).closest('.list-group-item').index();
        if (cart[index].quantity < 4) {
            cart[index].quantity += 1;
            updateCart();
        } else {
            alert("You cannot add more than 4 of this product to your cart!");
        }
    });

    $(document).on('click', '.quantity-selector-minus', function () {
        var index = $(this).closest('.list-group-item').index();
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            var removedItem = cart[index];
            cart.splice(index, 1);
            enableAddToCartButton(removedItem.id);
        }
        updateCart();
        updateCartCountBadge();
    });

    $('.cart-link').click(function () {
        showCart();
    })

    $('.cart-overlay').click(function () {
        hideCart();
    });

    $('.cart-container').click(function (e) {
        if (e.target === this) {
            e.stopPropagation();
        }
    });

    $(document).on('click', '.btn-remove-cart', function () {
        var itemID = $(this).data('id');
        var index = cart.findIndex(function (item) {
            return item.id === itemID;
        });

        if (index > -1) {
            cart.splice(index, 1);
            enableAddToCartButton(itemID);
        }

        updateCart();
    });
});


