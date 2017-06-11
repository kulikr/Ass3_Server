var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var cors = require('cors');
router.use(cors());
var DButilsAzure = require('./DBUtils');


router.get('/getAllProducts', function (req, res) {
    query = "SELECT * FROM products ;";
    DButilsAzure.Select(query).then(function (result) {
        res.send(result);
    }).catch(function (err) {
        res.send(err);
    });
});

router.get('/getProductsByCategory/:categoryID', function (req, res) {
    var categoryID = req.params.categoryID;
    query = "SELECT * FROM products WHERE productID IN (SELECT productID FROM productsCategories WHERE categoryID = " + categoryID + ") ;";
    DButilsAzure.Select(query).then(function (result) {
        res.send(result);
    }).catch(function (err) {
        res.send(err);
    });
});

router.get('/getProductByID/:productID', function (req, res) {
    var productID = req.params.productID;
    query = "SELECT * FROM products WHERE productID = " + productID + " ;";
    DButilsAzure.Select(query).then(function (result) {
        res.send(result);
    }).catch(function (err) {
        res.send(err);
    });
});

router.get('/getTop5Products', function (req, res) {
    query = "SELECT * FROM products WHERE productID IN (SELECT TOP 5 productID FROM userPurchasedProducts GROUP BY productID ORDER BY SUM(quantity) DESC);";
    DButilsAzure.Select(query).then(function (result) {
        res.send(result);
    }).catch(function (err) {
        res.send(err);
    });
});

router.get('/findProduct/:productName', function (req, res) {
    var productName = req.params.productName;
    query = "SELECT * FROM products WHERE productName = '" + productName + "' ;";
    DButilsAzure.Select(query).then(function (result) {
        res.send(result);
    }).catch(function (err) {
        res.send(err);
    });
});

router.get('/get5NewestProducts', function (req, res) {
    var query = "SELECT * FROM products WHERE productID NOT IN (SELECT TOP ((SELECT COUNT(*) FROM products) - 5 ) productID FROM products ORDER BY productID) ;";
    DButilsAzure.Select(query).then(function (result) {
        res.send(result);
    }).catch(function (err) {
        res.send(err);
    });
});

router.get('/getProductsByBrand/:brand', function (req, res) {
    var brand = req.params.brand;
    var query = "SELECT * FROM products WHERE brand = '" + brand + "' ;";
    DButilsAzure.Select(query).then(function (result) {
        res.send(result);
    }).catch(function (err) {
        res.send(err);
    });
});

router.get('/getProductsByColor/:color', function (req, res) {
    var color = req.params.color;
    var query = "SELECT * FROM products WHERE color = '" + color + "' ;";
    DButilsAzure.Select(query).then(function (result) {
        res.send(result);
    }).catch(function (err) {
        res.send(err);
    });
});

router.post('/addProduct', function (req, res) {
    var productName = req.body.content[0].productName;
    var currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var entranceDate = currentDate.split(' ')[0];
    var quantity = req.body.content[0].quantity;
    var price = req.body.content[0].price;
    var brand = req.body.content[0].brand;
    var color = req.body.content[0].color;

    var categories = [];

    for (var index = 0; index < req.body.content[1].length; index++) {
        categories[index] = {};
        categories[index] = req.body.content[1][index].categoryID;
    }

    var query = "INSERT INTO products VALUES('" + productName + "', '" + entranceDate + "', " + quantity + ", " + price + ", '" + brand + "', '" + color + "') ;";

    DButilsAzure.Insert(query).then(function (insertProductRes) {
        var productIDQuery = "SELECT MAX(productID) AS currentProductID FROM products ;";
        DButilsAzure.Select(productIDQuery).then(function (productIDRes) {
            var productID = productIDRes[0].currentProductID;
            var catQuery = "";
            for (var index = 0; index < categories.length; index++) {
                catQuery += "INSERT INTO productsCategories VALUES(" + categories[index] + " , " + productID + ") ;";
            }
            DButilsAzure.Insert(catQuery).then(function (insertCatRes) {
                res.send("success");
            }).catch(function (insertErr) {
                res.send(insertErr);
            });
        }).catch(function (productIDErr) {
            res.send(productIDErr);
        });
    }).catch(function (insertProductErr) {
        res.send("fail");
    });
});

router.post('/removeProduct', function (req, res) {
    var productID = req.body.productID;
    var query = "DELETE FROM products WHERE productID= " + productID + " ;";
    DButilsAzure.Delete(query).then(function (delRes) {
        res.send("success");
    }).catch(function (delErr) {
        res.send("fail");
    });
});

router.get('/getRecommendedProductsByUsers/:userName', function (req, res) {
    var userName = req.params.userName;
    var similarQuery = "SELECT TOP 1 userName,COUNT(DISTINCT productID) AS productCount FROM userPurchasedCarts INNER JOIN userPurchasedProducts ON userPurchasedCarts.purchaseID=userPurchasedProducts.purchaseID ";
    similarQuery += "WHERE productID IN(SELECT productID FROM userPurchasedProducts WHERE purchaseID ";
    similarQuery += "IN(SELECT purchaseID FROM userPurchasedCarts WHERE userName = '" + userName + "') AND userName <> '" + userName + "') GROUP BY userName ORDER BY productCount DESC ;";

    DButilsAzure.Select(similarQuery).then(function (similarRes) {
        if (similarRes.length > 0) {
            var similarUserName = similarRes[0].userName;
            var recQuery = "SELECT TOP 3 * FROM products WHERE productID IN(SELECT productID FROM userPurchasedProducts WHERE purchaseID ";
            recQuery += "IN(SELECT purchaseID FROM userPurchasedCarts WHERE userName = '" + userName + "')) ";
            recQuery += "AND productID NOT IN(SELECT productID FROM userPurchasedProducts WHERE purchaseID "
            recQuery += "IN(SELECT purchaseID FROM userPurchasedCarts WHERE userName ='" + similarUserName + "' ));"
            DButilsAzure.Select(recQuery).then(function (recRes) {
                res.send(recRes);
            }).catch(function (recErr) {
                res.send(recErr);
            });
        }
        else {
            res.send(similarRes);
        }
    }).catch(function (similarErr) {
        res.send(similarErr);
    });
});

router.get('/getRecommendedProductsByCategories/:userName', function (req, res) {
    var userName = req.params.userName;
    var catQuery = "SELECT categoryID from usersCategories WHERE userName ='" + userName + "' ;";
    DButilsAzure.Select(catQuery).then(function (catRes) {
        var recQuery = "SELECT TOP 3 * FROM products WHERE productID ";
        recQuery += "IN(SELECT productID FROM productsCategories WHERE categoryID=" + catRes[1].categoryID + " OR categoryID=" + catRes[0].categoryID + " ";
        recQuery += "GROUP BY productID HAVING COUNT(categoryID)=2) ;";
        DButilsAzure.Select(recQuery).then(function (recRes) {
            res.send(recRes);
        }).catch(function (recErr) {
            res.send(recErr);
        });
    }).catch(function (catErr) {
        res.send(catErr);
    });
});

module.exports = router;
