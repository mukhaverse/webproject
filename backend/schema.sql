
CREATE DATABASE medixa;
USE medixa;





CREATE TABLE testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO testimonials (name, message) VALUES
('test user', 'this is test testimonial'),
('test user 2', 'this is the testimonial again but we are making it a bit longer'),
('test user 3', 'another test testimonial');





CREATE TABLE interaction_checks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drug1 VARCHAR(100) NOT NULL,
  drug2 VARCHAR(100) NOT NULL,
  has_interaction BOOLEAN,
  severity VARCHAR(20),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO interaction_checks (drug1, drug2, has_interaction, severity, description) VALUES
('drug A', 'drug B', TRUE, 'high', 'this is a test interaction description showing a high severity case'),
('drug C', 'drug D', FALSE, 'low', 'this is another test description where no interaction is found'),
('drug E', 'drug F', TRUE, 'medium', 'this is a medium severity interaction example for testing purposes');






CREATE TABLE contact_messages (
  contact_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20),
  email VARCHAR(100) NOT NULL,
  language VARCHAR(30),
  gender VARCHAR(20),
  date_of_birth DATE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO contact_messages 
(first_name, last_name, phone_number, email, language, gender, date_of_birth, message) VALUES
('test', 'user', '0500000000', 'test1@email.com', 'English', 'Male', '2000-01-01', 'this is a test message from the contact form'),
('test', 'user2', '0511111111', 'test2@email.com', 'Arabic', 'Female', '1999-05-10', 'this is another test message but slightly longer for better testing'),
('test', 'user3', NULL, 'test3@email.com', 'English', 'Male', '2002-08-15', 'another test message just to fill the table');