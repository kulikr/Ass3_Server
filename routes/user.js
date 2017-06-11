var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var cors = require('cors');
router.use(cors());
var DButilsAzure = require('./DBUtils');

router.post('/register', function (req, res) {
    // User's details
    var userName = req.body.content[0].userName;
    var password = req.body.content[0].password;
    var firstName = req.body.content[0].firstName;
    var lastName = req.body.content[0].lastName;
    var birthDate = req.body.content[0].birthDate;
    var _address = req.body.content[0]._address;
    var city = req.body.content[0].city;
    var country = req.body.content[0].country;
    var phone = req.body.content[0].phone;
    var mail = req.body.content[0].mail;
    var country = req.body.content[0].country;
    var isAdmin = req.body.content[0].isAdmin; //? req.body[0].isAdmin : 0;

    // User's restore Q&A
    var q1_id = req.body.content[1].q1;
    var ans1 = req.body.content[1].ans1.toLowerCase();
    var q2_id = req.body.content[1].q2;
    var ans2 = req.body.content[1].ans2.toLowerCase();

    //user's categories
    var cat1 = req.body.content[2].cat1;
    var cat2 = req.body.content[2].cat2;
    var cat3 = req.body.content[2].cat3;

    userQuery = "INSERT INTO users VALUES ('" + userName + "','" + firstName + "', '" + lastName + "', '" + country + "', '" + city + "', '" + _address + "', '" + birthDate + "', '" + password + "', '" + mail + "', '" + phone + "', " + isAdmin + ");";
    DButilsAzure.Insert(userQuery).then(function (userRes) {
        questionQuery = "INSERT INTO usersQuestions VALUES (" + q1_id + ", '" + userName + "', '" + ans1 + "'); INSERT INTO usersQuestions VALUES (" + q2_id + ", '" + userName + "', '" + ans2 + "');"
        DButilsAzure.Insert(questionQuery).then(function (questionRes) {
            categoryQuery = "INSERT INTO usersCategories VALUES(" + cat1 + ", '" + userName + "') ; ";
            categoryQuery += "INSERT INTO usersCategories VALUES(" + cat2 + ", '" + userName + "') ; ";
            categoryQuery += "INSERT INTO usersCategories VALUES(" + cat3 + ", '" + userName + "') ; ";
            DButilsAzure.Insert(categoryQuery).then(function (catRes) {
                res.send("success");
            }).catch(function (catErr) {
                deleteQuery = "DELETE FROM users WHERE userName = '" + userName + "'  ;";
                deleteQuery += "DELETE FROM usersQuestions WHERE userName = '" + userName + "'  ;";
                DButilsAzure.Delete(deleteQuery).then(function (deleteRes) {
                    res.send("fail");
                }).catch(function (deleteErr) {
                    res.send(deleteErr);
                });
            });
        }).catch(function (questionErr) {
            deleteQuery = "DELETE FROM users WHERE userName = '" + userName + "'  ;";
            DButilsAzure.Delete(deleteQuery).then(function (deleteRes) {
                res.send("fail");
            }).catch(function (deleteErr) {
                res.send(deleteErr);
            });
        });
    }).catch(function (userError) {
        res.send(userError);
    });
});

router.post('/login', function (req, res) {
    var userName = req.body.userName;
    var password = req.body.password;
    query = "SELECT * FROM users WHERE userName = '" + userName + "' AND password = '" + password + "' ;";
    DButilsAzure.Select(query).then(function (result) {
        if (result.length == 1) {
            res.send(result);
        }
        else {
            res.send("fail");
        }
    }).catch(function (err) {
        res.send(err);
    });
});

router.get('/getUserCart/:userName', function (req, res) {
    var userName = req.params.userName;
    var query = "SELECT * FROM usersCurrentCart WHERE userName = '" + userName + "' ;";
    DButilsAzure.Select(query).then(function (result) {
        res.send(result);
    }).catch(function (err) {
        res.send(err);
    });
});

router.post('/restorePassword', function (req, res) {
    var ans1 = req.body.ans1.toLowerCase();;
    var ans2 = req.body.ans2.toLowerCase();;
    var userName = req.body.userName;
    restoreQuery = "SELECT userName FROM usersQuestions WHERE userName = '" + userName + "' AND (answer = '" + ans1 + "' OR answer = '" + ans2 + "') ;";
    DButilsAzure.Select(restoreQuery).then(function (restoreRes) {
        if (restoreRes.length == 2) {
            passwordQuery = "SELECT password FROM users WHERE userName = '" + userName + "' ;";
            DButilsAzure.Select(passwordQuery).then(function (passwordRes) {
                res.send(passwordRes);
            }).catch(function (passwordErr) {
                res.send(passwordErr);
            });
        }
        else {
            res.send("fail");
        }
    }).catch(function (restoreErr) {
        res.send(restoreErr);
    });
});

router.get('/getRestorePasswordQuestions/:userName', function (req, res) {
    var userName = req.params.userName;
    var query = "SELECT questionID FROM usersQuestions WHERE userName = '" + userName + "' ;";
    DButilsAzure.Select(query).then(function (result) {
        if (result.length == 2) {
            var questionsQuery = "SELECT question FROM restoreQuestions WHERE questionID = " + result[0].questionID + " OR questionID = " + result[1].questionID + ";"
            DButilsAzure.Select(questionsQuery).then(function (questionRes) {
                res.send(questionRes);
            }).catch(function (questionErr) {
                res.send(questionErr);
            });
        }
        else {
            res.send("fail");
        }
    }).catch(function (err) {
        res.send(err);
    });
});

router.post('/removeUser', function (req, res) {
    var userName = req.body.userName;
    query = "DELETE * FROM users WHERE userName = '" + userName + "';";
    DButilsAzure.Select(query).then(function (result) {
        if (result == 1) {
            res.send("success");
        }
        else {
            res.send("fail");
        }
    }).catch(function (err) {
        res.send(err);
    });
});

router.post('/updateCart', function (req, res) {
    var userName = req.body.content[0].userName;
    var cart = [];
    for (var index = 0; index < req.body.content[1].length; index++) {
        cart[index] = {};
        cart[index].productID = req.body.content[1][index].productID;
        cart[index].quantity = req.body.content[1][index].quantity;
    }
    var deleteQuery = "DELETE FROM usersCurrentCart WHERE userName = '" + userName + "' ;";
    DButilsAzure.Delete(deleteQuery).then(function (delRes) {
        var insertQuery="";
        for (var index = 0; index < cart.length; index++) {
            insertQuery += "INSERT INTO usersCurrentCart VALUES ('" + userName + "', " + cart[index].productID + ", " +cart[index].quantity  + ") ;";
        }
        DButilsAzure.Insert(insertQuery).then(function (insertRes) {
            res.send("success");
        }).catch(function (insertErr) {
            res.send("Fatal Error cart gone" + insertErr);
        });
    }).catch(function (delErr) {
        res.send(delErr);
    });
});


module.exports = router;