const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getDB } = require('../config/database');

class UserModel {
    static async createUser({ name, email, password, address = null, phone_number = null }) {
        const db = getDB();
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // For email verification (optional, can be expanded later)
        // const verification_token = crypto.randomBytes(20).toString('hex');

        const stmt = db.prepare(`
            INSERT INTO users (name, email, password_hash, address, phone_number) 
            VALUES (?, ?, ?, ?, ?)
        `);
        
        return new Promise((resolve, reject) => {
            stmt.run(name, email, password_hash, address, phone_number, function(err) {
                if (err) {
                    // Handle specific errors like UNIQUE constraint for email
                    if (err.message.includes('UNIQUE constraint failed: users.email')) {
                        return reject(new Error('Email already exists.'));
                    }
                    console.error("Error creating user:", err.message);
                    return reject(new Error('Failed to create user.'));
                }
                resolve({ id: this.lastID, name, email, address, phone_number });
            });
            stmt.finalize();
        });
    }

    static findByEmail(email) {
        const db = getDB();
        const sql = "SELECT id, name, email, password_hash, address, phone_number FROM users WHERE email = ?";
        return new Promise((resolve, reject) => {
            db.get(sql, [email], (err, row) => {
                if (err) {
                    console.error("Error finding user by email:", err.message);
                    return reject(new Error('Database error while finding user.'));
                }
                resolve(row); // Returns user object or undefined
            });
        });
    }

    static findById(id) {
        const db = getDB();
        const sql = "SELECT id, name, email, address, phone_number, created_at, updated_at FROM users WHERE id = ?"; // Exclude password_hash
        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error("Error finding user by ID:", err.message);
                    return reject(new Error('Database error while finding user.'));
                }
                resolve(row);
            });
        });
    }

    static async comparePassword(candidatePassword, hash) {
        return bcrypt.compare(candidatePassword, hash);
    }

    static async updateUserProfile(userId, { name, email, address, phone_number }) {
        const db = getDB();
        // Build query dynamically based on provided fields
        const fieldsToUpdate = {};
        if (name !== undefined) fieldsToUpdate.name = name;
        if (email !== undefined) fieldsToUpdate.email = email;
        if (address !== undefined) fieldsToUpdate.address = address;
        if (phone_number !== undefined) fieldsToUpdate.phone_number = phone_number;

        if (Object.keys(fieldsToUpdate).length === 0) {
            return Promise.resolve({ message: "No fields to update." });
        }

        const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), userId];

        const sql = `UPDATE users SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        return new Promise((resolve, reject) => {
            db.run(sql, values, function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed: users.email')) {
                        return reject(new Error('Email already in use by another account.'));
                    }
                    console.error("Error updating user profile:", err.message);
                    return reject(new Error('Failed to update user profile.'));
                }
                if (this.changes === 0) {
                    return reject(new Error('User not found or no changes made.'));
                }
                resolve({ message: "Profile updated successfully." });
            });
        });
    }

    // Placeholder for password reset token generation and saving
    static async setPasswordResetToken(email) {
        const db = getDB();
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

        const sql = `UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, [resetToken, resetTokenExpires.toISOString(), email], function(err) {
                if (err) {
                    console.error("Error setting password reset token:", err.message);
                    return reject(new Error('Failed to set password reset token.'));
                }
                if (this.changes === 0) {
                    return reject(new Error('User with that email not found.'));
                }
                resolve(resetToken); // Return the token to be sent via email (mocked)
            });
        });
    }
    
    static async resetPassword(token, newPassword) {
        const db = getDB();
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        const sql = `
            UPDATE users 
            SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL 
            WHERE password_reset_token = ? AND password_reset_expires > CURRENT_TIMESTAMP
        `;
        return new Promise((resolve, reject) => {
            db.run(sql, [password_hash, token], function(err) {
                if (err) {
                    console.error("Error resetting password:", err.message);
                    return reject(new Error('Failed to reset password.'));
                }
                if (this.changes === 0) {
                    return reject(new Error('Invalid or expired password reset token.'));
                }
                resolve({ message: "Password has been reset successfully." });
            });
        });
    }
}

module.exports = UserModel;
