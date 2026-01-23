
CREATE TABLE users (
  id char(36) NOT NULL,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  picture varchar(255) DEFAULT NULL,
  reset_otp varchar(6) DEFAULT NULL,
  reset_otp_expires datetime DEFAULT NULL,
  is_verified tinyint(1) DEFAULT '0',
  verification_otp varchar(6) DEFAULT NULL,
  verification_otp_expires datetime DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE items (
  id int NOT NULL AUTO_INCREMENT,
  title varchar(255) NOT NULL, -- User used 'name', but code uses 'title'. I will align code to 'name' in next steps or stick to 'title' if safer. User ref used 'name'.
  description text NOT NULL,
  status enum('available','pending','reserved','sold') DEFAULT 'available',
  category enum('books','furniture','clothing','sports','stationery','electronics','other') NOT NULL,
  item_condition enum('new','decent','too old') NOT NULL,
  uploaded_by char(36) NOT NULL, -- Back to uploaded_by from user_id
  price decimal(10,2) NOT NULL,
  image_url varchar(255) NOT NULL, -- User used 'image_path', code uses 'image_url'. I'll keep image_url to avoid breaking Frontend, or check.
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  quantity int DEFAULT '1',
  PRIMARY KEY (id),
  KEY items_ibfk_1 (uploaded_by),
  CONSTRAINT items_ibfk_1 FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE comments (
  id int NOT NULL AUTO_INCREMENT,
  item_id int NOT NULL,
  user_id char(36) NOT NULL,
  comment_text text NOT NULL,
  parent_comment_id int DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY item_id (item_id),
  KEY parent_comment_id (parent_comment_id),
  KEY comments_ibfk_2 (user_id),
  CONSTRAINT comments_ibfk_1 FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
  CONSTRAINT comments_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT comments_ibfk_3 FOREIGN KEY (parent_comment_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE bookings (
  id int NOT NULL AUTO_INCREMENT,
  item_id int NOT NULL,
  user_id char(36) NOT NULL,
  booked_quantity int NOT NULL DEFAULT '1',
  status enum('pending','confirmed','cancelled','reserved') DEFAULT 'pending',
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY item_id (item_id),
  KEY bookings_ibfk_2 (user_id),
  CONSTRAINT bookings_ibfk_1 FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE,
  CONSTRAINT bookings_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

