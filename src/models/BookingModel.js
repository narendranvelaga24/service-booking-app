const { getDB } = require('../config/database');
const ServiceModel = require('./ServiceModel'); // To fetch service details for price calculation

class BookingModel {
    static async createBooking({ user_id, service_ids, booking_date, booking_time, notes = null, mobile_service_address = null }) {
        const db = getDB();
        
        if (!service_ids || service_ids.length === 0) {
            throw new Error("At least one service must be selected for booking.");
        }

        // Fetch details of selected services to calculate total price and time
        const selectedServicesDetails = await ServiceModel.findByIds(service_ids);
        if (selectedServicesDetails.length !== service_ids.length) {
            throw new Error("One or more selected services are invalid.");
        }

        let total_price = 0;
        let total_estimated_time_minutes = 0;
        selectedServicesDetails.forEach(service => {
            total_price += service.price;
            total_estimated_time_minutes += service.estimated_time_minutes || 0;
        });

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION;", (err) => {
                    if (err) return reject(new Error("Failed to start transaction: " + err.message));
                });

                const bookingSql = `
                    INSERT INTO bookings (user_id, booking_date, booking_time, status, total_price, notes, mobile_service_address)
                    VALUES (?, ?, ?, 'pending', ?, ?, ?)
                `;
                db.run(bookingSql, [user_id, booking_date, booking_time, total_price, notes, mobile_service_address], function(err) {
                    if (err) {
                        db.run("ROLLBACK;");
                        console.error("Error creating booking:", err.message);
                        return reject(new Error('Failed to create booking.'));
                    }
                    
                    const bookingId = this.lastID;
                    const bookingItemsSql = `
                        INSERT INTO booking_items (booking_id, service_id, price_at_booking, estimated_time_minutes_at_booking)
                        VALUES (?, ?, ?, ?)
                    `;
                    const stmt = db.prepare(bookingItemsSql);
                    
                    let itemsProcessed = 0;
                    selectedServicesDetails.forEach(service => {
                        stmt.run(bookingId, service.id, service.price, service.estimated_time_minutes, (itemErr) => {
                            if (itemErr) {
                                db.run("ROLLBACK;");
                                console.error("Error creating booking item:", itemErr.message);
                                return reject(new Error('Failed to create booking item.'));
                            }
                            itemsProcessed++;
                            if (itemsProcessed === selectedServicesDetails.length) {
                                stmt.finalize((finalizeErr) => {
                                    if (finalizeErr) {
                                        db.run("ROLLBACK;");
                                        return reject(new Error("Failed to finalize booking items: " + finalizeErr.message));
                                    }
                                    db.run("COMMIT;", (commitErr) => {
                                        if (commitErr) {
                                            return reject(new Error("Failed to commit transaction: " + commitErr.message));
                                        }
                                        resolve({ 
                                            id: bookingId, 
                                            user_id, 
                                            booking_date, 
                                            booking_time, 
                                            status: 'pending', 
                                            total_price,
                                            total_estimated_time_minutes,
                                            selectedServicesDetails 
                                        });
                                    });
                                });
                            }
                        });
                    });
                });
            });
        });
    }

    static findByUserId(user_id) {
        const db = getDB();
        // This query can be expanded to join with booking_items and services for more detail
        const sql = `
            SELECT 
                b.id, b.booking_date, b.booking_time, b.status, b.total_price, b.created_at,
                GROUP_CONCAT(s.name, '; ') as services_booked
            FROM bookings b
            LEFT JOIN booking_items bi ON b.id = bi.booking_id
            LEFT JOIN services s ON bi.service_id = s.id
            WHERE b.user_id = ?
            GROUP BY b.id
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `;
        return new Promise((resolve, reject) => {
            db.all(sql, [user_id], (err, rows) => {
                if (err) {
                    console.error("Error fetching bookings by user ID:", err.message);
                    return reject(new Error('Failed to retrieve bookings.'));
                }
                resolve(rows);
            });
        });
    }

    static findById(booking_id) {
        const db = getDB();
        // Query to get booking details along with its items and service names
        const sql = `
            SELECT 
                b.id as booking_id, b.user_id, b.booking_date, b.booking_time, b.status, 
                b.total_price, b.notes, b.mobile_service_address, b.created_at as booking_created_at,
                u.name as user_name, u.email as user_email,
                s.id as service_id, s.name as service_name, s.description as service_description,
                bi.price_at_booking, bi.estimated_time_minutes_at_booking
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN booking_items bi ON b.id = bi.booking_id
            JOIN services s ON bi.service_id = s.id
            WHERE b.id = ?
        `;
        return new Promise((resolve, reject) => {
            db.all(sql, [booking_id], (err, rows) => {
                if (err) {
                    console.error("Error fetching booking by ID:", err.message);
                    return reject(new Error('Failed to retrieve booking details.'));
                }
                if (rows.length === 0) {
                    return resolve(null); // No booking found
                }
                // Aggregate service items into the main booking object
                const bookingDetails = {
                    id: rows[0].booking_id,
                    user_id: rows[0].user_id,
                    user_name: rows[0].user_name,
                    user_email: rows[0].user_email,
                    booking_date: rows[0].booking_date,
                    booking_time: rows[0].booking_time,
                    status: rows[0].status,
                    total_price: rows[0].total_price,
                    notes: rows[0].notes,
                    mobile_service_address: rows[0].mobile_service_address,
                    created_at: rows[0].booking_created_at,
                    services: rows.map(row => ({
                        id: row.service_id,
                        name: row.service_name,
                        description: row.service_description,
                        price_at_booking: row.price_at_booking,
                        estimated_time_minutes_at_booking: row.estimated_time_minutes_at_booking
                    }))
                };
                resolve(bookingDetails);
            });
        });
    }
    
    // Cancel a booking by ID and user ID
    static async cancelBooking(booking_id, user_id) {
        const db = getDB();
        // Ensure the booking belongs to the user and is in a cancellable state (e.g., 'pending' or 'confirmed')
        const sql = "UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND status IN ('pending', 'confirmed')";
        
        console.log(`Executing SQL to cancel booking: ${sql} with params [${booking_id}, ${user_id}]`);

        return new Promise((resolve, reject) => {
            db.run(sql, [booking_id, user_id], function(err) {
                if (err) {
                    console.error("Database error cancelling booking:", err.message);
                    return reject(new Error('Failed to cancel booking due to database error.'));
                }
                // Check if any rows were affected (means a booking was found and updated)
                console.log(`SQL execution complete. Changes: ${this.changes}`);
                resolve(this.changes > 0);
            });
        });
    }

    // Delete a booking by ID and user ID
    static async deleteBooking(booking_id, user_id) {
        const db = getDB();
        
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION;", (err) => {
                    if (err) return reject(new Error("Failed to start transaction for deletion: " + err.message));
                });

                // First, delete related booking items
                const deleteItemsSql = "DELETE FROM booking_items WHERE booking_id = ?";
                db.run(deleteItemsSql, [booking_id], (err) => {
                    if (err) {
                        db.run("ROLLBACK;");
                        console.error("Database error deleting booking items:", err.message);
                        return reject(new Error('Failed to delete booking items.'));
                    }

                    // Then, delete the booking itself, ensuring user ownership
                    const deleteBookingSql = "DELETE FROM bookings WHERE id = ? AND user_id = ?";
                    db.run(deleteBookingSql, [booking_id, user_id], function(err) {
                        if (err) {
                            db.run("ROLLBACK;");
                            console.error("Database error deleting booking:", err.message);
                            return reject(new Error('Failed to delete booking.'));
                        }

                        if (this.changes === 0) {
                            db.run("ROLLBACK;");
                            console.warn(`Attempted to delete booking ID: ${booking_id} for user ID: ${user_id}, but no matching booking found or owned.`);
                            return resolve(false); // No booking found or owned by user
                        }

                        db.run("COMMIT;", (commitErr) => {
                            if (commitErr) {
                                return reject(new Error("Failed to commit deletion transaction: " + commitErr.message));
                            }
                            console.log(`Booking ID: ${booking_id} deleted successfully from database.`);
                            resolve(true); // Booking deleted successfully
                        });
                    });
                });
            });
        });
    }


    // Admin: Update booking status (e.g., 'confirmed', 'completed', 'cancelled')
    static async updateBookingStatus(booking_id, status) {
        const db = getDB();
        const sql = "UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return new Promise((resolve, reject) => {
            db.run(sql, [status, booking_id], function(err) {
                if (err) {
                    console.error("Error updating booking status:", err.message);
                    return reject(new Error('Failed to update booking status.'));
                }
                if (this.changes === 0) {
                    return reject(new Error('Booking not found or status unchanged.'));
                }
                resolve({ message: `Booking status updated to ${status}.` });
            });
        });
    }
}

module.exports = BookingModel;
