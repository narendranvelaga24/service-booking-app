const { getDB } = require('../config/database');

class TipModel {
    static getAllTips() {
        const db = getDB();
        const sql = "SELECT id, title, content, created_at, updated_at FROM tips ORDER BY title";
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error("Error fetching all tips:", err.message);
                    return reject(new Error('Failed to retrieve tips.'));
                }
                resolve(rows);
            });
        });
    }

    static findById(id) {
        const db = getDB();
        const sql = "SELECT * FROM tips WHERE id = ?";
        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error("Error finding tip by ID:", err.message);
                    return reject(new Error('Database error while finding tip.'));
                }
                resolve(row);
            });
        });
    }

    // Admin: Create a new tip
    static createTip({ title, content }) {
        const db = getDB();
        const sql = `INSERT INTO tips (title, content) VALUES (?, ?)`;
        return new Promise((resolve, reject) => {
            db.run(sql, [title, content], function(err) {
                if (err) {
                    console.error("Error creating tip:", err.message);
                    return reject(new Error('Failed to create tip.'));
                }
                resolve({ id: this.lastID, title, content });
            });
        });
    }

    // Admin: Update an existing tip
    static updateTip(id, { title, content }) {
        const db = getDB();
        const sql = `UPDATE tips SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [title, content, id], function(err) {
                if (err) {
                    console.error("Error updating tip:", err.message);
                    return reject(new Error('Failed to update tip.'));
                }
                if (this.changes === 0) {
                    return reject(new Error('Tip not found or no changes made.'));
                }
                resolve({ message: "Tip updated successfully." });
            });
        });
    }

    // Admin: Delete a tip
    static deleteTip(id) {
        const db = getDB();
        const sql = "DELETE FROM tips WHERE id = ?";
        return new Promise((resolve, reject) => {
            db.run(sql, [id], function(err) {
                if (err) {
                    console.error("Error deleting tip:", err.message);
                    return reject(new Error('Failed to delete tip.'));
                }
                if (this.changes === 0) {
                    return reject(new Error('Tip not found.'));
                }
                resolve({ message: "Tip deleted successfully." });
            });
        });
    }
}

module.exports = TipModel;
