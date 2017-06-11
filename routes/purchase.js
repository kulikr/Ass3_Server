var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var cors = require('cors');
router.use(cors());
var DButilsAzure = require('./DBUtils');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

router.post('/purchase', function (req, res) {
    var userName = req.body.content[0].userName;
    var currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var purchaseDate = currentDate.split(' ')[0];
    var deliveryDate = req.body.content[0].deliveryDate;
    var price = req.body.content[0].price;
    var cart = [];

    for (var index = 0; index < req.body.content[1].length; index++) {
        cart[index] = {};
        cart[index].productID = req.body.content[1][index].productID;
        cart[index].quantity = req.body.content[1][index].quantity;
    }
    insertPurchaseQuery = "INSERT INTO userPurchasedCarts VALUES ('" + userName + "','" + purchaseDate + "', '" + deliveryDate + "', " + price + " ) ;";
    DButilsAzure.Insert(insertPurchaseQuery).then(function (userRes) {
        purchaseIDQuery = "SELECT MAX(purchaseID) AS currentPurchaseID FROM userPurchasedCarts WHERE userName ='" + userName + "' ;";
        DButilsAzure.Select(purchaseIDQuery).then(function (purchaseIDRes) {
            var purchaseID = purchaseIDRes[0].currentPurchaseID;
            var insertProductsQuery = "";
            for (var index = 0; index < cart.length; index++) {
                insertProductsQuery += "INSERT INTO userPurchasedProducts VALUES(" + purchaseID + "," + cart[index].productID + ", " + cart[index].quantity + ") ;";
            }
            DButilsAzure.Select(insertProductsQuery).then(function (insertProductsRes) {
                var updateStockQuery = "";
                for (var index = 0; index < cart.length; index++) {
                    updateStockQuery += "UPDATE products SET quantity = quantity-" + cart[index].quantity + " WHERE productID = " + cart[index].productID + " ;";
                }
                DButilsAzure.Update(updateStockQuery).then(function (updateStockRes) {
                    var emptyCartQuery = "DELETE FROM usersCurrentCart WHERE userName = '" + userName + "' ;";
                    DButilsAzure.Delete(emptyCartQuery).then(function (emptyCartRes) {
                        var purchaseIDResult={};
                        purchaseIDResult.purchaseID=purchaseID;
                        res.send(purchaseIDResult);
                    }).catch(function (emptyCartErr) {
                        res.send(emptyCartErr);
                    });
                }).catch(function (updateStockError) {
                    res.send(updateStockError);
                });

            }).catch(function (insertProductsError) {
                res.send(insertProductsError);
            });
        }).catch(function (purchaseIDError) {
            res.send(purchaseIDError);
        });
    }).catch(function (insertPurchaseError) {
        res.send(insertPurchaseError);
    });
});

router.get('/getUserPurchases/:userName', function (req, res) {
    var userName = req.params.userName;
    var purchaseQuery = "SELECT * FROM userPurchasedCarts WHERE userName = '" + userName + "'";
    DButilsAzure.Select(purchaseQuery).then(function (purchasRes) {
        res.send(purchasRes);
    }).catch(function (err) {
        res.send(err);
    });
});

router.get('/getPurchasedProducts/:purchaseID', function (req, res) {
    var purchaseID = req.params.purchaseID;
    var purchaseQuery = "SELECT * FROM userPurchasedProducts WHERE purchaseID = " + purchaseID + "";
    DButilsAzure.Select(purchaseQuery).then(function (purchasRes) {
        res.send(purchasRes);
    }).catch(function (err) {
        res.send(err);
    });
});

router.get('/getCurrency', function (req, res) {
    var xmlhttp = new XMLHttpRequest();
    var url = "http://apilayer.net/api/live?access_key=041eb273ec8b5f2bc4a39bfe155a8529&currencies=USD,ILS&format=1";

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            res.send(JSON.parse(this.responseText));
        }
        if (this.readyState == 4 && this.status != 200) {
            res.send("fail");
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
});

/***** API KEY =041eb273ec8b5f2bc4a39bfe155a8529 *****/
/*********Currency JSON format *************/
/*
{
  "success":true,
  "terms":"https:\/\/currencylayer.com\/terms",
  "privacy":"https:\/\/currencylayer.com\/privacy",
  "timestamp":1496955546,
  "source":"USD",
  "quotes":{
    "USDUSD":1,
    "USDILS":3.524398
  }
}
*/


module.exports = router;