const { getDB } = require('../config/database');

class ServiceModel {
    // Admin: Create a new service
    static createService({ name, description, price, estimated_time_minutes, category, is_mobile_service_option = 0 }) {
        const db = getDB();
        const sql = `INSERT INTO services (name, description, price, estimated_time_minutes, category, is_mobile_service_option)
                     VALUES (?, ?, ?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            db.run(sql, [name, description, price, estimated_time_minutes, category, is_mobile_service_option], function(err) {
                if (err) {
                    console.error("Error creating service:", err.message);
                    return reject(new Error('Failed to create service.'));
                }
                resolve({ id: this.lastID, name, description, price });
            });
        });
    }

    // Get all services for public listing
    static getAllServices() {
        const db = getDB();
        const sql = "SELECT * FROM services ORDER BY category, name";
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error("Error fetching all services:", err.message);
                    return reject(new Error('Failed to retrieve services.'));
                }
                resolve(rows);
            });
        });
    }

    // Get a single service by ID
    static findById(id) {
        const db = getDB();
        const sql = "SELECT * FROM services WHERE id = ?";
        return new Promise((resolve, reject) => {
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error("Error finding service by ID:", err.message);
                    return reject(new Error('Database error while finding service.'));
                }
                resolve(row); // Returns service object or undefined
            });
        });
    }
    
    // Get multiple services by IDs (useful for cart/booking)
    static findByIds(ids) {
        if (!ids || ids.length === 0) {
            return Promise.resolve([]);
        }
        const db = getDB();
        const placeholders = ids.map(() => '?').join(',');
        const sql = `SELECT * FROM services WHERE id IN (${placeholders})`;
        return new Promise((resolve, reject) => {
            db.all(sql, ids, (err, rows) => {
                if (err) {
                    console.error("Error fetching services by IDs:", err.message);
                    return reject(new Error('Failed to retrieve services by IDs.'));
                }
                resolve(rows);
            });
        });
    }


    // Admin: Update an existing service
    static updateService(id, { name, description, price, estimated_time_minutes, category, is_mobile_service_option }) {
        const db = getDB();
        // Build query dynamically
        const fieldsToUpdate = {};
        if (name !== undefined) fieldsToUpdate.name = name;
        if (description !== undefined) fieldsToUpdate.description = description;
        if (price !== undefined) fieldsToUpdate.price = price;
        if (estimated_time_minutes !== undefined) fieldsToUpdate.estimated_time_minutes = estimated_time_minutes;
        if (category !== undefined) fieldsToUpdate.category = category;
        if (is_mobile_service_option !== undefined) fieldsToUpdate.is_mobile_service_option = is_mobile_service_option;

        if (Object.keys(fieldsToUpdate).length === 0) {
            return Promise.resolve({ message: "No fields to update." });
        }

        const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), id];
        
        const sql = `UPDATE services SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.run(sql, values, function(err) {
                if (err) {
                    console.error("Error updating service:", err.message);
                    return reject(new Error('Failed to update service.'));
                }
                if (this.changes === 0) {
                    return reject(new Error('Service not found or no changes made.'));
                }
                resolve({ message: "Service updated successfully." });
            });
        });
    }

    // Admin: Delete a service
    static deleteService(id) {
        const db = getDB();
        const sql = "DELETE FROM services WHERE id = ?";
        return new Promise((resolve, reject) => {
            db.run(sql, [id], function(err) {
                if (err) {
                    // Check for foreign key constraint error if service is part of a booking_item
                    if (err.message.includes('FOREIGN KEY constraint failed')) {
                         return reject(new Error('Cannot delete service: It is referenced in existing bookings. Consider deactivating instead.'));
                    }
                    console.error("Error deleting service:", err.message);
                    return reject(new Error('Failed to delete service.'));
                }
                if (this.changes === 0) {
                    return reject(new Error('Service not found.'));
                }
                resolve({ message: "Service deleted successfully." });
            });
        });
    }
}

module.exports = ServiceModel;
