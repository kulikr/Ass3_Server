CREATE TABLE products(
productID int IDENTITY(1,1),
productName varchar(20) NOT NULL,
entranceDate date NOT NULL,
quantity int NOT NULL,
price float NOT NULL,
description varchar(255) NOT NULL,
PRIMARY KEY(productID)
);

CREATE TABLE users(
userName varchar(8),
firstName varchar(20) NOT NULL,
lastName varchar(20) NOT NULL,
country varchar(20) NOT NULL,
city varchar(20) NOT NULL,
address varchar(50) NOT NULL,
birthDate date NOT NULL,
password varchar(10) NOT NULL,
mail varchar(25) NOT NULL,
phone varchar(15) NOT NULL,
isAdmin int NOT NULL DEFAULT(0),
PRIMARY KEY(userName)
);

CREATE TABLE restoreQuestions(
questionID int,
question varchar(100),
PRIMARY KEY(questionID)
);

CREATE TABLE usersQuestions(
questionID int FOREIGN KEY references restoreQuestions(questionID)
ON DELETE CASCADE,
userName varchar(8) FOREIGN KEY references users(userName)
ON DELETE CASCADE,
answer varchar(100),
PRIMARY KEY(questionID,userName)
);

CREATE TABLE usersCurrentCart(
userName varchar(8) FOREIGN KEY references users(userName)
ON DELETE CASCADE,
productID int FOREIGN KEY references products(productID)
ON DELETE CASCADE,
quantity int NOT NULL,
PRIMARY KEY(productID,userName)
);
CREATE TABLE userPurchasedCarts(
purchaseID varchar(10) IDENTITY(1,1) PRIMARY KEY,
userName varchar(8) FOREIGN KEY references users(userName)
ON DELETE CASCADE,
purchaseDate date NOT NULL,
price int NOT NULL
);

CREATE TABLE userPurchasedProducts(
purchaseID int(10) FOREIGN KEY references userPurchasedCarts(purchaseID)
ON DELETE CASCADE,
productID int FOREIGN KEY references products(productID)
ON DELETE CASCADE,
quantity int NOT NULL,
PRIMARY KEY(purchaseID,productID)
);

CREATE TABLE categories(
categoryID int PRIMARY KEY,
categoryName varchar(20)
);

CREATE TABLE usersCategories(
categoryID int FOREIGN KEY references categories(categoryID)
ON DELETE CASCADE,
userName varchar(8) FOREIGN KEY references users(userName)
ON DELETE CASCADE,
PRIMARY KEY(categoryID,userName)
);

CREATE TABLE productsCategories(
categoryID int FOREIGN KEY references categories(categoryID)
ON DELETE CASCADE,
productID int FOREIGN KEY references products(productID)
ON DELETE CASCADE,
PRIMARY KEY(categoryID,productID)
);