// import { Request } from "express";
// import { extractSessionVars } from "../../utils/utils";
// import { createEvent, EventDetailsTypes } from "../../utils/calendar";

// const handleScheduleTable = async (req: Request) => {
//     try {
//         const sessionVars = extractSessionVars(req.body);
//         console.log(sessionVars);
//         const eventDetails: EventDetailsTypes = {
//             summary: `New booking for ${sessionVars?.person.name}`,
//             description: `${sessionVars?.email},${sessionVars?.number1}`,
//             startTime: sessionVars?.date_time?.date_time
//         }
//         const eventData = await createEvent(eventDetails)
//         console.log(eventData);
//     } catch (error) {
//         console.error('Error in create-event route:', error);
//     }
// };

// export default handleScheduleTable;
// import { Request } from "express";
// import { extractSessionVars } from "../../utils/utils";
// import { bookTableIfAvailable } from "../../utils/dbService";

// const handleScheduleTable = async (req: Request) => {
//     try {
//         const sessionVars = extractSessionVars(req.body);
//         const { name, email, date, time, number_of_persons } = sessionVars;

//         const bookingResponse = await bookTableIfAvailable(name, email, date, time, number_of_persons);

//         if (!bookingResponse.success) {
//             console.log(bookingResponse.message);
//         } else {
//             console.log('Booking confirmed:', bookingResponse.calendarLink);
//         }

//     } catch (error) {
//         console.error('Error in scheduleTable:', error);
//     }
// };

// export default handleScheduleTable;
import { Request } from "express";
import { extractSessionVars } from "../../utils/utils";
import { bookTableIfAvailable } from "../../utils/dbService";

const handleScheduleTable = async (req: Request) => {
    try {
        const sessionVars = extractSessionVars(req.body);
        
        // Check if sessionVars is defined and extract the necessary properties
        if (!sessionVars) {
            throw new Error("Session variables are not defined.");
        }

        // const { email, date_time, number1 } = sessionVars.parameters; // Update to access parameters
        const name = sessionVars.person.name;
        const email=sessionVars.email // Access name directly from person
        const date_time=sessionVars.date_time.date_time
        const number1=sessionVars.number1

        // Call the booking function
        const bookingResponse = await bookTableIfAvailable(name, email, date_time, number1);

        // Handle the booking response
        if (!bookingResponse.success) {
            console.log(bookingResponse.message);
        } else {
            console.log('Booking confirmed:', bookingResponse.calendarLink);
        }
        return bookingResponse;

    } catch (error) {
        console.error('Error in scheduleTable:', error);
        return {
            success: false,
            message: 'An error occurred while processing your request.'
        };
    }
};

export default handleScheduleTable;

