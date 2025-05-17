const { getDB } = require('../config/database');

class TeamMemberModel {
    static getAllTeamMembers() {
        const db = getDB();
        const sql = "SELECT id, name, role, image_url, description, created_at, updated_at FROM team_members ORDER BY name";
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error("Error fetching all team members:", err.message);
                    return reject(new Error('Failed to retrieve team members.'));
                }
                resolve(rows);
            });
        });
    }

    // Admin: Create a new team member
    static createTeamMember({ name, role, image_url, description }) {
        const db = getDB();
        const sql = `INSERT INTO team_members (name, role, image_url, description) VALUES (?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            db.run(sql, [name, role, image_url, description], function(err) {
                if (err) {
                    console.error("Error creating team member:", err.message);
                    return reject(new Error('Failed to create team member.'));
                }
                resolve({ id: this.lastID, name, role });
            });
        });
    }

    // Other CRUD operations (findById, update, delete) can be added here if admin functionality is expanded.
}

module.exports = TeamMemberModel;
