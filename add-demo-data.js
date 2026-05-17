const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

// Add workers
db.run("INSERT INTO workers (name, phone, skill) VALUES ('Ahmed Al Balushi', '91234567', 'HVAC')");
db.run("INSERT INTO workers (name, phone, skill) VALUES ('Salim Al Hinai', '92345678', 'Cleaning')");
db.run("INSERT INTO workers (name, phone, skill) VALUES ('Mohammed Al Riyami', '93456789', 'MEP')");
db.run("INSERT INTO workers (name, phone, skill) VALUES ('Rashid Al Saadi', '94567890', 'Security')");
db.run("INSERT INTO workers (name, phone, skill) VALUES ('Khalid Al Shukaili', '95678901', 'General Labour')");

// Add sites
db.run("INSERT INTO sites (name, location, client_name) VALUES ('Al Mouj Tower', 'Muscat', 'Al Mouj Group')");
db.run("INSERT INTO sites (name, location, client_name) VALUES ('City Centre Mall', 'Seeb', 'Majid Al Futtaim')");
db.run("INSERT INTO sites (name, location, client_name) VALUES ('Oman Air Headquarters', 'Airport Heights', 'Oman Air')");

// Add today's attendance
const today = new Date().toISOString().split('T')[0];
db.run(`INSERT INTO attendance (worker_id, site_id, date, check_in, status) VALUES (1, 1, '${today}', '07:30 AM', 'Present')`);
db.run(`INSERT INTO attendance (worker_id, site_id, date, check_in, status) VALUES (2, 2, '${today}', '08:00 AM', 'Present')`);
db.run(`INSERT INTO attendance (worker_id, site_id, date, check_in, status) VALUES (3, 1, '${today}', '07:45 AM', 'Present')`);
db.run(`INSERT INTO attendance (worker_id, site_id, date, check_in, status) VALUES (4, 3, '${today}', '07:00 AM', 'Present')`);
db.run(`INSERT INTO attendance (worker_id, site_id, date, check_in, status) VALUES (5, 2, '${today}', '08:15 AM', 'Late')`);

// Add pending tasks
db.run("INSERT INTO tasks (worker_id, site_id, task_description, due_date, status) VALUES (1, 1, 'Fix AC chiller fault', '2026-05-18', 'Pending')");
db.run("INSERT INTO tasks (worker_id, site_id, task_description, due_date, status) VALUES (2, 2, 'Deep cleaning food court', '2026-05-17', 'Pending')");
db.run("INSERT INTO tasks (worker_id, site_id, task_description, due_date, status) VALUES (4, 3, 'Gate security patrol schedule', '2026-05-19', 'Pending')");

db.close(() => {
    console.log('✅ Demo data added successfully!');
    console.log('Now restart your server: node server.js');
});