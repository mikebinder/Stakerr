DROP DATABASE IF EXISTS project_db
USE project_db

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  user_name VARCHAR(45) NOT NULL,
  email VARCHAR(45) NOT NULL,
  phone INT NOT NULL,
  user_pw VARCHAR(45) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE goals (
  user_id INT NOT NULL,
  id INT NOT NULL AUTO_INCREMENT,
  goal_text VARCHAR(45) NOT NULL,
  goal_start DATE NOT NULL,
  goal_end DATE NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE wagers (
  id INT NOT NULL AUTO_INCREMENT,
  wager_amount INT NOT NULL,
  wager_fill INT NOT NULL,
  goal_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (id)
);