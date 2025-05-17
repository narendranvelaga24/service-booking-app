const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_NAME = process.env.NODE_ENV === 'test' ? 'test.db' : 'main.db';
const DB_PATH = path.join(__dirname, '..', '..', 'database', DB_NAME);
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'database', 'schema.sql');
const DATA_PATH = path.join(__dirname, '..', '..', 'database', 'data.sql');

let db;

function connect() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error(`Error connecting to the SQLite database (${DB_NAME}).`, err.message);
                return reject(err);
            }
            console.log(`Connected to the SQLite database (${DB_NAME}).`);
            // Enable foreign key support
            db.run("PRAGMA foreign_keys = ON;", (pragmaErr) => {
                if (pragmaErr) {
                    console.error("Failed to enable foreign key support:", pragmaErr.message);
                    return reject(pragmaErr);
                }
                resolve(db);
            });
        });
    });
}

function initializeDB() {
    return new Promise(async (resolve, reject) => {
        if (!db) {
            try {
                await connect();
            } catch (err) {
                return reject(err);
            }
        }

        fs.readFile(SCHEMA_PATH, 'utf8', (err, schemaSql) => {
            if (err) {
                console.error('Error reading schema.sql:', err.message);
                return reject(err);
            }
            db.exec(schemaSql, (execErr) => {
                if (execErr) {
                    console.error('Error executing schema.sql:', execErr.message);
                    return reject(execErr);
                }
                console.log('Database schema initialized.');

                // Check if services table is empty to decide on seeding data
                db.get("SELECT COUNT(*) as count FROM services", (err, row) => {
                    if (err) {
                        console.error('Error checking services table:', err.message);
                        // Proceed, schema might have just been created
                    }

                    if (row && row.count > 0) {
                        console.log('Services data already exists. Skipping data.sql execution.');
                        return resolve();
                    }

                    fs.readFile(DATA_PATH, 'utf8', (dataErr, dataSql) => {
                        if (dataErr) {
                            console.error('Error reading data.sql:', dataErr.message);
                            return reject(dataErr);
                        }
                        db.exec(dataSql, (execDataErr) => {
                            if (execDataErr) {
                                console.error('Error executing data.sql:', execDataErr.message);
                                return reject(execDataErr);
                            }
                            console.log('Sample services data inserted.');
                            resolve();
                        });
                    });
                });
            });
        });
    });
}

function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connect() or initializeDB() first.');
    }
    return db;
}

function closeDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing the database connection.', err.message);
                    return reject(err);
                }
                console.log('Database connection closed.');
                db = null; // Clear the instance
                resolve();
            });
        } else {
            resolve(); // No connection to close
        }
    });
}


module.exports = {
    connect,
    initializeDB,
    getDB,
    closeDB
};
