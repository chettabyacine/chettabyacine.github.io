$(document).ready(function () {

    function displayTable(data) {
        let products = data;
        let tbody = $("#productsTable tbody");
        tbody.empty();

        const productRowTemplate = Handlebars.compile($("#product-row-template").html());

        for (let product of products) {
            product.sizes = [
                { size: 'sizexs', quantity: product.sizexs },
                { size: 'sizes', quantity: product.sizes },
                { size: 'sizem', quantity: product.sizem },
                { size: 'sizel', quantity: product.sizel },
                { size: 'sizexl', quantity: product.sizexl }
            ];
            tbody.append(productRowTemplate(product));
        }
        tbody.find('.decrease').on('click', function () {
            const input = $(this).siblings('.size-input');
            input.val(Math.max(parseInt(input.val(), 10) - 1, 0));
        });

        tbody.find('.increase').on('click', function () {
            const input = $(this).siblings('.size-input');
            input.val(parseInt(input.val(), 10) + 1);
        });

    }

    $.getJSON("/fetch_products", function (data) {
        displayTable(data);
    });


    $("#logoutButton").on("click", function () {
        $.ajax({
            url: '/logout',
            method: 'POST',
            success: function () {
                window.location.href = '/';
            },
            error: function () {
                alert('Error logging out. Please try again.');
            }
        });
    });


    $(document).on('click', '.btn-send', function () {
        const paymentId = $(this).data('id');
        const button = $(this);

        $.ajax({
            url: '/updatePaymentStatus/' + paymentId,
            method: 'PUT',
            success: function (response) {
                button.replaceWith('<span class="span-sent">sent</span>');
            },
            error: function () {
                alert('An error occurred while updating the payment status.');
            },
        });
    });



    $('#addProductTable, #productsTable, #payment-form-table').find('input[type="text"], textarea, input[type="number"]').hover(function () {
        $(this).css('border', '2px solid lightgrey');
    }, function () {
        $(this).css('border', '1px solid lightgray');
    }).focus(function () {
        $(this).css('border', '2px solid lightgrey');
    }).blur(function () {
        $(this).css('border', '1px solid lightgray');

    });




    function saveChanges() {
        let rows = $("#productsTable tbody tr");

        let updateRequests = [];

        for (let row of rows) {
            let $row = $(row);
            let xs, s, m, l, xl;
            xs = $row.find("td:nth-child(8) .size-input[data-size='sizexs']").val();
            s = $row.find("td:nth-child(9) .size-input[data-size='sizes']").val();
            m = $row.find("td:nth-child(10) .size-input[data-size='sizem']").val();
            l = $row.find("td:nth-child(11) .size-input[data-size='sizel']").val();
            xl = $row.find("td:nth-child(12) .size-input[data-size='sizexl']").val();
            let id = $(row).find("td:nth-child(1)").text();
            if (xs + s + m + l + xl < 1) {
                console.log("deleting id = "+ id);
                $.ajax({
                    url: '/delete/' + id,
                    type: 'DELETE',
                    success: function (result) {
                        console.log(result);
                    },
                    error: function (err) {
                        console.log('Error: ', err);
                    }
                });

            } else {
                let updatedProduct = {
                    id: $row.find("td:nth-child(1)").text(),
                    name: $row.find("td:nth-child(2) input").val(),
                    description: $row.find("td:nth-child(3) input").val(),
                    image: $row.find("td:nth-child(4) input").val(),
                    alt: $row.find("td:nth-child(5) input").val(),
                    price: $row.find("td:nth-child(6) input").val(),
                    type: $row.find("td:nth-child(7) input").val(),
                    sizexs: xs,
                    sizes: s,
                    sizem: m,
                    sizel: l,
                    sizexl: xl,
                    brand: $row.find("td:nth-child(13) input").val()
                };

                updateRequests.push(
                    $.ajax({
                        url: "/adminEdit/" + updatedProduct.id,
                        type: "PUT",
                        data: JSON.stringify(updatedProduct),
                        contentType: "application/json"
                    })
                );
            }
        }

        $.when(...updateRequests).done(function () {
            $.getJSON("/fetch_products", function (data) {
                displayTable(data);
            });
        }).fail(function () {
            alert("Error");
        });

    }

    $("#productsTable").on("blur", "input[type='text'], input[type='number']", function () {
        alert("saved");
        saveChanges();
         $.getJSON("/fetch_products", function (data) {
            displayTable(data);
        });
        
    });

    $("#saveAllChanges").on("click", saveChanges());

    // USERS
    function populatePaymentFormTable(data) {
        const source = $("#payment-form-template").html();
        const template = Handlebars.compile(source);

        const processedData = data.reduce((acc, curr) => {
            const existingUserIndex = acc.findIndex(user => user.id === curr.id);
            if (existingUserIndex === -1) {
                curr.total_price = parseFloat(curr.total_price);
                curr.product_id = curr.product_id.join(', ');
                acc.push(curr);
            } else {
                acc[existingUserIndex].total_price += parseFloat(curr.total_price);
                acc[existingUserIndex].product_id += ', ' + curr.product_id.join(', ');
            }
            return acc;
        }, []);

        const html = template({ data: processedData });
        $("#payment-form-table-body").html(html);
    }

    function fetchPaymentFormData() {
        $.ajax({
            url: '/getPaymentFormData',
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                populatePaymentFormTable(response);
            },
            error: function () {
                console.error('An error occurred while fetching payment form data.');
            },
        });
    }

    fetchPaymentFormData();

    $("#addProductButton").on("click", function () {
        let s, xs, m, l, xl;

        if ($("input[name='newProductSizeXS']").val() === '') {
            xs = 0;
        } else {
            xs = parseInt($("input[name='newProductSizeXS']").val(), 10);
        }

        if ($("input[name='newProductSizeS']").val() === '') {
            s = 0;
        } else {
            s = parseInt($("input[name='newProductSizeS']").val(), 10);
        }

        if ($("input[name='newProductSizeM']").val() === '') {
            m = 0;
        } else {
            m = parseInt($("input[name='newProductSizeM']").val(), 10);
        }

        if ($("input[name='newProductSizeL']").val() === '') {
            l = 0;
        } else {
            l = parseInt($("input[name='newProductSizeL']").val(), 10);
        }

        if ($("input[name='newProductSizeXL']").val() === '') {
            xl = 0;
        } else {
            xl = parseInt($("input[name='newProductSizeXL']").val(), 10);
        }

        const newProduct = {
            name: $("input[name='newProductName']").val(),
            description: $("input[name='newProductDescription']").val(),
            image: $("input[name='newProductImage']").val(),
            alt: $("input[name='newProductAlt']").val(),
            price: $("input[name='newProductPrice']").val(),
            type: $("input[name='newProductType']").val(),
            sizexs: xs,
            sizes: s,
            sizem: m,
            sizel: l,
            sizexl: xl,
            brand: $("input[name='newProductBrand']").val()
        };

        if (xs + s + m + l + xl < 1) {
            alert("Add at least one copy of the product");
        } else {



            $.ajax({
                url: "/adminAdd",
                type: "POST",
                data: JSON.stringify(newProduct),
                contentType: "application/json",
                success: function (response) {
                    console.log("New product added successfully:", response);
                    $.getJSON("/fetch_products", function (data) {
                        displayTable(data);
                    });
                },
                error: function () {
                    console.error("Error adding new product.");
                }
            });
        }
    })

    function fetchProducts() {
        $.ajax({
            url: '/fetch_products',
            method: 'GET',
            dataType: 'json',
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                displayTable(data);
            }
        });
    }


    function searchProducts(searchTerm) {
        $.ajax({
            url: '/search_product',
            method: 'GET',
            data: { query: searchTerm },
            dataType: 'json',
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                console.log(data.length);
                if (data.length > 0) {
                    displayTable(data);
                } else {
                    fetchProducts();
                }
            },
            error: function () {
                $('#product-list').html('');
                console.error('An error occurred while searching for products.');
            }
        });
    }

    $('#search-btn').click(function () {
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
});
