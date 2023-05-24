/**
 * This file contains two SQL query strings, fetchProductsQuery and searchProductsQuery, 
 * which are used in the controller.js file to fetch all products or search for products based on a search term. 
 */

// products
const fetchProductsQuery = 'SELECT * FROM products';

const getProductsFromIdQuery = 'SELECT * FROM products WHERE id = $1';

const searchProductsQuery = `
    SELECT * FROM products
    WHERE LOWER(name) LIKE LOWER('%' || $1 || '%')
    OR LOWER(description) LIKE LOWER('%' || $1 || '%')
    OR LOWER(keyword) LIKE LOWER('%' || $1 || '%')
  `;

  const searchProductQuery = `
    SELECT * FROM products
    WHERE id = $1;
  `;

const updateProductQuery = `UPDATE products SET name = $1, description = $2, image = $3, alt = $4, price = $5, type = $6, 
sizexs = $7, sizes = $8, sizem = $9, sizel = $10, sizexl = $11, brand = $12 WHERE id = $13 `;

const updateSizesQuery = "UPDATE products SET sizexs = $2, sizes = $3, sizem = $4, sizel = $5, sizexl = $6 WHERE id = $1"

// users
const handleLoginQuery = "SELECT * FROM users WHERE email = $1 AND password = $2";

const checkEmailExistsQuery = 'SELECT * FROM paymentForm WHERE email = $1';

const getUserByIdQuery = 'SELECT * FROM users WHERE id = $1';

// paymentForm
const createPaymentFormQuery = `
  INSERT INTO paymentForm
  (user_name, user_family_name, email, date_of_birth, phone_number, address, additional_address_information, city, country)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING id;
`;

const getPaymentFormDataQuery = `
SELECT 
    pf.id,
    pf.user_name,
    pf.user_family_name,
    pf.email,
    pf.date_of_birth,
    pf.phone_number,
    pf.address,
    pf.additional_address_information,
    pf.city,
    pf.country,
    SUM(p.price) as total_price,
    array_agg(p.id) as product_id,
    pf.is_send
FROM paymentForm pf
JOIN payment_products pp ON pf.id = pp.payment_id
JOIN products p ON pp.product_id = p.id
GROUP BY pf.id;
`;

// payment_products
const createOrderQuery = "INSERT INTO payment_products (payment_id, product_id) VALUES ($1, $2)";

const insertProductQuery = `
  INSERT INTO products (name, description, image, alt, price, type, sizexs, sizes, sizem, sizel, sizexl, brand)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  RETURNING id;
`;


module.exports = { fetchProductsQuery, insertProductQuery, searchProductsQuery, handleLoginQuery, checkEmailExistsQuery, createPaymentFormQuery, getUserByIdQuery, updateProductQuery, getPaymentFormDataQuery, createOrderQuery, getProductsFromIdQuery, updateSizesQuery , searchProductQuery};
