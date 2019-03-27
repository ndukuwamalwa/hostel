CREATE VIEW user_view AS SELECT email, password, level, creator, DATE_FORMAT(created, '%D of %M, %Y') AS created FROM user;

CREATE VIEW hostel_view AS SELECT hostelNo, title, FORMAT(capacity, 0) AS capacity, DATE_FORMAT(created, '%d-%m-%Y') AS created FROM hostel;

CREATE VIEW room_view AS SELECT room.roomNo, room.hostel, hostel.title, room.capacity, FORMAT(room.price, 2) AS price FROM room INNER JOIN hostel
ON room.hostel = hostel.hostelNo;

CREATE VIEW resident_view AS SELECT admNo, CONCAT(fname,' ', lname) AS name, phone, parentPhone, nationalId, DATE_FORMAT(created, '%D of %M, %Y') AS
created FROM resident;

CREATE VIEW booking_view AS SELECT booking.id, booking.resident, CONCAT(resident.fname, ' ', resident.lname) AS name, hostel.title, booking.room,
booking.occupants, FORMAT(booking.paid, 2) AS paid, FORMAT(booking.credit, 2) AS credit, booking.year, booking.startMonth, booking.endMonth
FROM booking INNER JOIN resident ON booking.resident = resident.admNo INNER JOIN room ON booking.room = room.roomNo INNER JOIN hostel ON
room.hostel = hostel.hostelNo;

CREATE VIEW residentRoom_view AS SELECT residentRoom.id, residentRoom.resident, CONCAT(resident.fname, ' ', resident.lname) AS name, 
residentRoom.room, hostel.title, residentRoom.year, residentRoom.startMonth, residentRoom.endMonth FROM residentRoom INNER JOIN resident ON
residentRoom.resident = resident.admNo INNER JOIN room ON residentRoom.room = room.roomNo INNER JOIN hostel ON room.hostel = hostel.hostelNo;