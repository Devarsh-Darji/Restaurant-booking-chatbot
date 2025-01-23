import { createPool } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { createEvent } from './calendar';
import moment from 'moment-timezone';
import dotenv from "dotenv";

dotenv.config();

const db = createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});
console.log('Database connected')

// Check for table availability
async function checkTableAvailability(date_time: string, number_of_persons: number) {
    // Query to find tables that can accommodate the requested number of persons
    const [tables]: [RowDataPacket[], any] = await db.query(
        'SELECT table_id FROM tables WHERE table_size >= ?',
        [number_of_persons]
    );

    if (tables.length === 0) return null; // No table can accommodate the requested size

    for (let table of tables) {
        const tableId = table.table_id;

        // Calculate start and end times for the requested reservation
        const requestedStartTime = moment(date_time).format("YYYY-MM-DD HH:mm:ss");
        const requestedEndTime = moment(date_time).add(1, 'hour').format("YYYY-MM-DD HH:mm:ss");
        console.log(requestedStartTime);
        console.log(requestedEndTime);

        // Query to check for existing reservations that overlap with the requested time
        const [existingReservations]: [RowDataPacket[], any] = await db.query(
            `SELECT * FROM reservations 
            WHERE table_id = ? 
            AND date = ? 
            AND (
                (time <= ? AND ADDTIME(time, '01:00:00') > ?) 
                              OR 
                (time < ? AND ADDTIME(time, '01:00:00') >= ?)
                              OR
                (? < time AND ? > time)    
                              OR
                (? < ADDTIME(time, '01:00:00') AND ? > ADDTIME(time, '01:00:00')) 
            )`,
            [tableId, moment(date_time).format("YYYY-MM-DD"), requestedStartTime, requestedStartTime, requestedEndTime, requestedEndTime, requestedStartTime, requestedEndTime, requestedStartTime, requestedEndTime ]
        );

        if (existingReservations.length === 0) {
            // Table is available for the requested date and time
            return tableId;
        }
    }
    return null; // No available table at the requested time
}

// Book a table if available
async function bookTableIfAvailable(name: string, email: string, date_time: string, number_of_persons: number) {
    const tableId = await checkTableAvailability(date_time, number_of_persons);

    if (!tableId) {
        console.log('No table available for the requested time slot.');
        return { success: false, message: 'No table is available for the requested time slot.' };
    }

    // Create Google Calendar event
    const startTime = moment.tz(date_time, 'Asia/Kolkata').format();
    const eventDetails = {
        summary: `Restaurant Booking for ${name}`,
        description: `Reservation for ${number_of_persons} persons.`,
        startTime,
    };

    try {
        const calendarResponse = await createEvent(eventDetails);
        console.log('Calendar event created:', calendarResponse.htmlLink);

        // Save the reservation in the database
        await db.query(
            'INSERT INTO reservations (table_id, name, email, date, time, number_of_persons) VALUES (?, ?, ?, ?, ?, ?)',
            [tableId, name, email, moment(date_time).format("YYYY-MM-DD"), moment(date_time).format("HH:mm:ss"), number_of_persons]
        );

        return {
            success: true,
            message: 'Booking confirmed',
            calendarLink: calendarResponse.htmlLink,
        };
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

export { bookTableIfAvailable };

// (time<? AND ?<ADDTIME(time, '01:00:00'))
//                 OR
//                 (time<? AND ?<ADDTIME(time, '01:00:00'))