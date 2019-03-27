DELIMITER $$

CREATE TRIGGER tokens_ai AFTER INSERT ON tokens 
FOR EACH ROW
BEGIN
	UPDATE user SET ready = 0 WHERE email = NEW.username;
END$$

CREATE TRIGGER user_bu BEFORE UPDATE ON user
FOR EACH ROW
BEGIN
	IF NEW.password <> OLD.password THEN
		SET NEW.ready = 1;
	END IF;
END$$

CREATE TRIGGER user_au AFTER UPDATE ON user
FOR EACH ROW
BEGIN
	IF NEW.password <> OLD.password THEN
		UPDATE tokens SET used = 1 WHERE username = OLD.email;
	END IF;
END$$

CREATE TRIGGER hostel_bi BEFORE INSERT ON hostel
FOR EACH ROW
BEGIN
	DECLARE totalHostels INT DEFAULT 0;
	DECLARE hostelNo VARCHAR(255) DEFAULT '';
	SET @totalHostels := (SELECT id FROM hostel ORDER BY id DESC LIMIT 1) + 1;
	IF @totalHostels IS NULL THEN
		SET @totalHostels := 1;
	END IF;
	SET @hostelNo := CONCAT('HOST/', @totalHostels, CONCAT('/', YEAR(NEW.created), ''));
	SET NEW.hostelNo = @hostelNo;
END$$

CREATE TRIGGER hostel_bu BEFORE UPDATE ON hostel
FOR EACH ROW
BEGIN
	IF OLD.capacity > NEW.capacity THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Hostel capacity can only be increased.';
	END IF;
	IF NEW.hostelNo <> OLD.hostelNo THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'To ensure the consistency of the system, it is not possible to change the hostel number.';
	END IF;
END$$

CREATE TRIGGER room_bi BEFORE INSERT ON room
FOR EACH ROW
BEGIN
	DECLARE roomNo VARCHAR(255) DEFAULT '';
	DECLARE roomsInHostel INT DEFAULT 0;
	DECLARE hostelCapacity INT DEFAULT 0;
	DECLARE roomsCapacity INT DEFAULT 0;
	DECLARE remaining INT DEFAULT 0;
	SET @hostelCapacity := (SELECT capacity FROM hostel WHERE hostelNo = NEW.hostel);
	SET @roomsCapacity := (SELECT SUM(capacity) FROM room WHERE hostel = NEW.hostel);
	SET @roomsInHostel := (SELECT id FROM room WHERE hostel = NEW.hostel ORDER BY id DESC LIMIT 1) +1;
	IF @roomsInHostel IS NULL THEN
		SET @roomsInHostel := 1;
	END IF;
	IF @hostelCapacity = @roomsCapacity THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Hostel has reached its maximum capacity.';
	END IF;
	SET @remaining := @hostelCapacity - @roomsCapacity;
	IF (NEW.capacity + @roomsCapacity) > @hostelCapacity THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The entered capacity will cause the hostel to overflow.';
	END IF;
	IF NEW.price < 0 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room price cannot be less than 0.';
	END IF;
	SET @roomNo = CONCAT('ROOM/', NEW.hostel, CONCAT('/', @roomsInHostel, ''));
	SET NEW.roomNo = @roomNo;
END$$

CREATE TRIGGER room_bu BEFORE UPDATE ON room
FOR EACH ROW
BEGIN
	DECLARE roomNo VARCHAR(255) DEFAULT '';
	DECLARE roomsInHostel INT DEFAULT 0;
	DECLARE hostelCapacity INT DEFAULT 0;
	DECLARE roomsCapacity INT DEFAULT 0;
	SET @hostelCapacity := (SELECT capacity FROM hostel WHERE hostelNo = OLD.hostel);
	SET @roomsCapacity := (SELECT SUM(capacity) FROM room WHERE hostel = OLD.hostel);
	SET @roomsInHostel := (SELECT COUNT(*) FROM room WHERE hostel = OLD.hostel);
	IF NEW.capacity <> OLD.capacity AND @hostelCapacity = @roomsCapacity THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Hostel has reached its maximum capacity.';
	END IF;
	IF (NEW.capacity + @roomsCapacity - OLD.capacity) > @hostelCapacity THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The entered capacity will cause the hostel to overflow.';
	END IF;
	IF @roomsInHostel IS NULL THEN
		SET @roomsInHostel := 0;
	END IF;
	IF NEW.price < 0 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room price cannot be less than 0.';
	END IF;
	IF NEW.roomNo <> OLD.roomNo THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'To ensure the consistency of the system, it is not possible to change the room number.';
	END IF;
END$$

CREATE TRIGGER booking_bi BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
	DECLARE roomCapacity INT DEFAULT 0;
	DECLARE booked INT DEFAULT 0;
	DECLARE occupants INT DEFAULT 0;
	DECLARE amountToPay DOUBLE(10, 2);
	DECLARE roomPrice DOUBLE DEFAULT 0;
	SET @roomPrice := (SELECT price FROM room WHERE roomNo = NEW.room);
	SET @roomCapacity := (SELECT capacity FROM room WHERE roomNo = NEW.room);
	SET @booked = (SELECT COUNT(*) FROM booking WHERE room = NEW.room AND year = NEW.year AND startMonth = NEW.startMonth AND endMonth = NEW.endMonth);
	IF @booked IS NULL THEN
		SET @booked = 0;
	END IF;
	IF @booked = @roomCapacity THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room has reached the maximum occupants.';
	END IF;
	IF NEW.occupants > @roomCapacity THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Occupants cannot be more than the room capacity.';
	END IF;
	IF @occupants IS NULL THEN
		SET @occupants := 0;
	END IF;
	IF @booked > 0 THEN
		SET @occupants := (SELECT occupants FROM booking WHERE room = NEW.room AND year = NEW.year AND startMonth = NEW.startMonth AND endMonth = NEW.endMonth LIMIT 1);
		SET @amountToPay := (SELECT credit FROM booking WHERE room = NEW.room AND year = NEW.year AND startMonth = NEW.startMonth AND endMonth = NEW.endMonth LIMIT 1);
		IF @amountToPay = @roomPrice THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The room has reached maximum occupants';
		END IF;
		SET NEW.occupants = @occupants;
		SET NEW.credit = @amountToPay;
	END IF;
	IF @booked = 0 THEN
		SET NEW.credit = @roomPrice/NEW.occupants;
		SET @amountToPay = @roomPrice/NEW.occupants;
	END IF;
	IF @amountToPay IS NULL THEN
		SET @amountToPay = @roomPrice / @occupants;
	END IF;
	IF NEW.paid > @amountToPay THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The amount entered will cause an overpayment';
	END IF;
END$$

CREATE TRIGGER booking_ai AFTER INSERT ON booking
FOR EACH ROW
BEGIN
	IF NEW.credit = NEW.paid THEN
		INSERT INTO residentRoom VALUES(null, NEW.resident, NEW.room, NEW.year, NEW.startMonth, NEW.endMonth, NEW.paid);
	END IF;
END$$

CREATE TRIGGER booking_bu BEFORE UPDATE ON booking
FOR EACH ROW
BEGIN
	IF NEW.occupants <> OLD.occupants THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You cannot update the number of occupants once it is set.';
	END IF;
	IF NEW.paid > OLD.credit THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You cannot pay more than the amount due.';
	END IF;
END$$

CREATE TRIGGER booking_au AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
	IF NEW.credit = NEW.paid AND NEW.paid <> OLD.paid THEN
		INSERT INTO residentRoom VALUES(null, NEW.resident, NEW.room, NEW.year, NEW.startMonth, NEW.endMonth, NEW.paid);
	END IF;
	IF NEW.credit > NEW.paid THEN
		DELETE FROM residentRoom WHERE resident = NEW.resident AND room = NEW.room AND startMonth = NEW.startMonth AND endMonth = NEW.endMonth;
	END IF;
END$$

DELIMITER ;