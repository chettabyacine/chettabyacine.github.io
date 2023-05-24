$(document).ready(function () {

    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    const tbody = $('#cart-items tbody');
    let totalPrice = 0;

    cartItems.forEach(function (item) {
        const name = item.name;
        const price = item.price;
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
        const quantity = item.quantity;
        const total = price * quantity;
        totalPrice += total;

        const tr = $('<tr></tr>');
        tr.append(`<td>${name}</td>`);
        tr.append(`<td>${the_size}</td>`);
        tr.append(`<td>$${price.toFixed(2)}</td>`);
        tr.append(`<td>${quantity}</td>`);
        tr.append(`<td>$${total.toFixed(2)}</td>`);
        tbody.append(tr);
    });

    $('#total-price').text(`Total Price: $${totalPrice.toFixed(2)}`);

    $('#registration-form').on('submit', function (e) {
        e.preventDefault();

        console.log('Form submitted:', $(this).serialize());
        postRequestRegistration();
    });

    function postRequestRegistration() {
        const user_name = $('input[name="user_name"]').val();
        const user_family_name = $('input[name="user_family_name"]').val();
        const email = $('input[name="email"]').val();
        const date_of_birth = $('input[name="date_of_birth"]').val();
        const phone_number = $('input[name="phone_number"]').val();
        const address = $('input[name="address"]').val();
        const additional_address_information = $('input[name="additional_address_information"]').val();
        const city = $('input[name="city"]').val();
        const country = $('input[name="country"]').val();
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const productIds = cartItems.map(product => product.id);
        $.ajax({
            url: '/paymentForm',
            method: 'POST',
            data: {
                user_name: user_name,
                user_family_name: user_family_name,
                email: email,
                date_of_birth: date_of_birth,
                phone_number: phone_number,
                address: address,
                additional_address_information: additional_address_information,
                city: city,
                country: country,
                productIds: JSON.stringify(productIds)
            },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    console.log('User registered successfully.');
                    window.location.href = "index.html";
                } else if (response.status === 'failure')   {
                    if (response.message === 'Email already exists.') {
                        alert('Email already exists. Please try again.');
                        return;
                    }
                    alert('Registration failed. Please try again.');
                }
            },
            error: function () {
                console.error('An error occurred while registering.');
            },
        });
    }
});
