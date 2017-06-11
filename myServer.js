var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Connection = require('tedious').Connection;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var cors = require('cors');
app.use(cors());

//router requires
var user = require("./routes/user");
var product= require("./routes/product");
var purchase= require("./routes/purchase");

//---User------------------------------------------------------------------------------------------------------------
app.post('/register', user); //
app.post('/login', user); //
app.get('/getUserCart/:userName',user); //
app.post('/restorePassword',user); //
app.get('/getRestorePasswordQuestions/:userName',user); //
app.post('/removeUser',user); //
app.post('/updateCart',user); //
//-------------------------------------------------------------------------------------------------------------------

//---Product---------------------------------------------------------------------------------------------------------
app.get('/getAllProducts',product); //
app.get('/getProductsByCategory/:categoryID',product); //
app.get('/getProductByID/:productID',product); //
app.get('/getTop5Products',product); //
app.get('/findProduct/:productName',product); //
app.get('/get5NewestProducts',product); //
app.post('/addProduct',product); //
app.get('/getProductsByColor/:color', product);//
app.get('/getProductsByBrand/:brand', product);//
app.get('/getRecommendedProductsByUsers/:userName',product); //
app.get('/getRecommendedProductsByCategories/:userName',product); //
app.post('/removeProduct',product); //
//-------------------------------------------------------------------------------------------------------------------

//---Purchase--------------------------------------------------------------------------------------------------------
app.post('/purchase',purchase); //
app.get('/getUserPurchases/:userName',purchase); //
app.get('/getPurchasedProducts/:purchaseID',purchase); //
app.get('/getCurrency', purchase); //
//-------------------------------------------------------------------------------------------------------------------

var port = 4000;
app.listen(port, function () {
    console.log('App listening on port ' + port);   
});

module.exports=app;
