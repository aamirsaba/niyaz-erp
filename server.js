const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('database.sqlite');

// Create tables
db.serialize(() => {
  // Workers table
  db.run(`CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    skill TEXT,
    status TEXT DEFAULT 'Active'
  )`);

  // Sites table
  db.run(`CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    client_name TEXT
  )`);

  // Attendance table
  db.run(`CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER,
    site_id INTEGER,
    date TEXT,
    check_in TEXT,
    check_out TEXT,
    status TEXT,
    FOREIGN KEY(worker_id) REFERENCES workers(id),
    FOREIGN KEY(site_id) REFERENCES sites(id)
  )`);

  // Tasks table
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER,
    site_id INTEGER,
    task_description TEXT,
    due_date TEXT,
    status TEXT DEFAULT 'Pending',
    FOREIGN KEY(worker_id) REFERENCES workers(id),
    FOREIGN KEY(site_id) REFERENCES sites(id)
  )`);
});

// API Routes

// Get all workers
app.get('/api/workers', (req, res) => {
  db.all("SELECT * FROM workers", (err, rows) => {
    if (err) res.json({ error: err.message });
    else res.json(rows);
  });
});

// Add worker
app.post('/api/workers', (req, res) => {
  const { name, phone, skill } = req.body;
  db.run("INSERT INTO workers (name, phone, skill) VALUES (?, ?, ?)",
    [name, phone, skill],
    function(err) {
      if (err) res.json({ error: err.message });
      else res.json({ id: this.lastID });
    });
});

// Get all sites
app.get('/api/sites', (req, res) => {
  db.all("SELECT * FROM sites", (err, rows) => {
    if (err) res.json({ error: err.message });
    else res.json(rows);
  });
});

// Add site
app.post('/api/sites', (req, res) => {
  const { name, location, client_name } = req.body;
  db.run("INSERT INTO sites (name, location, client_name) VALUES (?, ?, ?)",
    [name, location, client_name],
    function(err) {
      if (err) res.json({ error: err.message });
      else res.json({ id: this.lastID });
    });
});

// Add attendance
app.post('/api/attendance', (req, res) => {
  const { worker_id, site_id, date, check_in, status } = req.body;
  db.run("INSERT INTO attendance (worker_id, site_id, date, check_in, status) VALUES (?, ?, ?, ?, ?)",
    [worker_id, site_id, date, check_in, status],
    function(err) {
      if (err) res.json({ error: err.message });
      else res.json({ id: this.lastID });
    });
});

// Get today's attendance
app.get('/api/attendance/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.all(`
    SELECT a.*, w.name as worker_name, s.name as site_name 
    FROM attendance a
    JOIN workers w ON a.worker_id = w.id
    JOIN sites s ON a.site_id = s.id
    WHERE a.date = ?
  `, [today], (err, rows) => {
    if (err) res.json({ error: err.message });
    else res.json(rows);
  });
});

// Add task
app.post('/api/tasks', (req, res) => {
  const { worker_id, site_id, task_description, due_date } = req.body;
  db.run("INSERT INTO tasks (worker_id, site_id, task_description, due_date) VALUES (?, ?, ?, ?)",
    [worker_id, site_id, task_description, due_date],
    function(err) {
      if (err) res.json({ error: err.message });
      else res.json({ id: this.lastID });
    });
});

// Get pending tasks
app.get('/api/tasks/pending', (req, res) => {
  db.all(`
    SELECT t.*, w.name as worker_name, s.name as site_name 
    FROM tasks t
    JOIN workers w ON t.worker_id = w.id
    JOIN sites s ON t.site_id = s.id
    WHERE t.status = 'Pending'
  `, (err, rows) => {
    if (err) res.json({ error: err.message });
    else res.json(rows);
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  db.get("SELECT COUNT(*) as total_workers FROM workers", (err, workerCount) => {
    db.get("SELECT COUNT(*) as total_sites FROM sites", (err, siteCount) => {
      db.get(`SELECT COUNT(*) as present_today FROM attendance WHERE date = ? AND status = 'Present'`, [today], (err, presentCount) => {
        db.get("SELECT COUNT(*) as pending_tasks FROM tasks WHERE status = 'Pending'", (err, taskCount) => {
          res.json({
            total_workers: workerCount.total_workers,
            total_sites: siteCount.total_sites,
            present_today: presentCount.present_today || 0,
            pending_tasks: taskCount.pending_tasks || 0
          });
        });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Niyaz ERP running at http://localhost:${port}`);
});