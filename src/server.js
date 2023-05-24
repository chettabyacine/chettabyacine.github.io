const express = require('express');
const cors = require('cors');
const customClient = require('./database');
const { fetchProductsQuery, searchProductsQuery, handleLoginQuery, checkEmailExistsQuery, updateSizesQuery, getProductsFromIdQuery, createPaymentFormQuery, createOrderQuery, updateProductQuery, getPaymentFormDataQuery, insertProductQuery , searchProductQuery} = require('./queries');
const path = require('path');
const session = require('express-session');

const port = 3000;
const app = express();


app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({ secret: "your-secret-key", resave: false, saveUninitialized: true }));



function checkAuthentication(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect("/login.html");
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/search_products', async (req, res) => {
  try {
    const searchTerm = req.query.query;
    const queryResult = await customClient.query(searchProductsQuery, [searchTerm]);
    res.json(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while searching for products.' });
  }
});

app.get('/search_product', async (req, res) => {
  try {
    const searchTerm = req.query.query;
    const queryResult = await customClient.query(searchProductQuery, [searchTerm]);
    res.json(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while searching for product.' });
  }
});

app.get('/fetch_products', async (req, res) => {
  try {
    const queryResult = await customClient.query(fetchProductsQuery);
    res.json(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching products.' });
  }
});

function checkAuthentication(req, res, next) {
  if (req.session.isAuthenticated) {
    return next();
  } else {
    res.redirect("/login.html");
  }
}

app.get("/protected/admin.js", checkAuthentication, (req, res) => {
  res.type('application/javascript').sendFile(__dirname + "/protected/admin.js");
});

app.get("/protected/admin.css", checkAuthentication, (req, res) => {
  res.type('text/css').sendFile(__dirname + "/protected/admin.css");
});

app.get("/admin", checkAuthentication, (req, res) => {
  res.sendFile(__dirname + "/protected/adminIndex.html");
});

app.delete('/delete/:id', async (req, res) => {
  const id = req.params.id;
  console.log("deleting id = "+id);
  try {
    const result = await customClient.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ status: 'success', message: 'Row deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'An error occurred' });
  }
});

app.post("/authenticate", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const queryResult = await customClient.query(handleLoginQuery, [email, password]);
    if (queryResult.rowCount > 0) {
      if (queryResult.rows[0].is_admin === true) {
        req.session.isAuthenticated = true;
        res.json({ status: 'success', redirectUrl: '/admin' });
      } else {
        res.json({ status: 'failure', message: 'The user is not an Admin.', redirectUrl: '/login.html' });
      }
    } else {
      res.json({ status: 'failure', message: 'Incorrect username or password. Please try again.', redirectUrl: '/login.html' });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post('/paymentForm', async (req, res) => {
  try {
    const { user_name, user_family_name, email, date_of_birth, phone_number, address, additional_address_information, city, country, productIds } = req.body;

   

    const parsedProductIds = JSON.parse(productIds);

    // create user and get id
    const createUserResult = await customClient.query(createPaymentFormQuery, [
      user_name, user_family_name, email, date_of_birth, phone_number, address, additional_address_information, city, country
    ]);
    const userID = createUserResult.rows[0].id;

    // json parse productIds
    for (let i = 0; i < parsedProductIds.length; i++) {
      const productID = parsedProductIds[i];

      // get product information
      const getProductResult = await customClient.query(getProductsFromIdQuery, [productID]);
      const product = getProductResult.rows[0];

      // update product sizes
      let queryValues = [productID];
      let updateValues = [product.sizexs, product.sizes, product.sizem, product.sizel, product.sizexl];
      for (let j = 0; j < parsedProductIds.length; j++) {
        if (parsedProductIds[j] == productID) {
          updateValues[j % 5]--;
        }
      }
      queryValues.push(updateValues[0], updateValues[1], updateValues[2], updateValues[3], updateValues[4]);
      await customClient.query(updateSizesQuery, queryValues);

      // create payment products
      await customClient.query(createOrderQuery, [userID, productID]);
    }

    res.json({ status: 'success', message: 'Product IDs: ', productIds });
  } catch (error) {
    console.error("Error in handleRegister:", error);
    res.status(500).json({ error: 'An error occurred while registering.' });
  }
});

app.get('/getPaymentFormData', async (req, res) => {
  try {
    const result = await customClient.query(getPaymentFormDataQuery);
    const paymentFormData = result.rows;
    res.json(paymentFormData);
  } catch (error) {
    console.error('Error fetching payment form data:', error);
    res.status(500).json({ error: 'An error occurred while fetching payment form data.' });
  }
});

app.put('/updatePaymentStatus/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const updateQuery = `
          UPDATE paymentForm 
          SET is_send = true 
          WHERE id = $1
      `;

      await customClient.query(updateQuery, [id]);
      res.status(200).json({ message: 'Payment status updated successfully.' });
  } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ error: 'An error occurred while updating payment status.' });
  }
});


app.post('/adminAdd', async (req, res) => {
  const { name, description, image, alt, price, type, sizexs, sizes, sizem, sizel, sizexl, brand } = req.body;
  console.log(req.body);
  try {
    const insertResult = await customClient.query(insertProductQuery, [name, description, image, alt, price, type, sizexs, sizes, sizem, sizel, sizexl, brand]);
    const insertedProductId = insertResult.rows[0].id;

    res.status(200).json({ message: 'Product added successfully.', productId: insertedProductId });
  } catch (error) {
    console.error("Error in adding new product:", error);
    res.status(500).json({ error: 'An error occurred while adding the product.' });
  }
});


app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else {
      console.log("User logged out successfully.");
      res.status(200).send();
    }
  });
});


app.put('/adminEdit/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, image, alt, price, type, sizexs, sizes, sizem, sizel, sizexl, brand } = req.body;
  try {
    await customClient.query(updateProductQuery, [name, description, image, alt, price, type, sizexs, sizes, sizem, sizel, sizexl, brand, id]);
    res.status(200).json({ message: 'Product updated successfully.' });
  } catch (error) {
    console.error("Error in updating product:", error);
    res.status(500).json({ error: 'An error occurred while updating the product.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
