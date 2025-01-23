import {Router, Request, Response} from "express";
import { generateResponseObject, ResponseObject } from "../../utils/utils";
import handleScheduleTable from "../controllers/scheduleTable";
const router = Router()

// router.post('/webhook', (req: Request, res: Response) => {
    // const fulfillmentMessages = {
    //     fulfillmentMessages: [
    //         {
    //             text: {
    //                 text: ['From the webhook...']
    //             }
    //         }
    //     ]
    // };
    // res.send(fulfillmentMessages);
    //res.send(generateResponseObject(['From the webhook','One more message.']))

    //original
//     router.post('/webhook', async (req: Request, res: Response) => {
//         console.log(JSON.stringify(req.body, null, 2));
//         const action = req.body.queryResult.action as string;
//         let responseData: ResponseObject = {
//             fulfillmentMessages: []
//         };
//         if (action === 'scheduleTable') {
//             await handleScheduleTable(req);
//             responseData.fulfillmentMessages = req.body.queryResult.fulfillmentMessages;
//         } else {
//             responseData = generateResponseObject([`No handler for the action ${action}.`]);
//         }
//         res.send(responseData);
// });

// export default router;

//new with db

router.post('/webhook', async (req: Request, res: Response) => {
    console.log(JSON.stringify(req.body, null, 2)); // Log the incoming request body for debugging
    const action = req.body.queryResult.action as string; // Extract the action from the query result
    let responseData: ResponseObject = {
        fulfillmentMessages: []
    };

    if (action === 'scheduleTable') {
        const bookingResponse = await handleScheduleTable(req);

        // Respond based on the result of handleScheduleTable
        if (bookingResponse.success) {
            responseData.fulfillmentMessages = [
                { text: { text: [`Booking confirmed! Check your calendar here: ${bookingResponse.calendarLink}`] } }
            ];
        } else {
            responseData.fulfillmentMessages = [
                { text: { text: [bookingResponse.message] } }
            ];
        }
    } else {
        // If the action is not recognized, generate a default response
        responseData = generateResponseObject([`No handler for the action ${action}.`]);
    }

    // Send the response back to Dialogflow
    res.send(responseData);
});

export default router;
