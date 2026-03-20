import sesClient from './sesClient.js';
import { SendEmailCommand } from '@aws-sdk/client-ses';

export const sendEmail = async (recipientEmail, subject, body) => {
    const params = {
        Source: process.env.AWS_SES_SENDER,
        Destination: {
            ToAddresses: [
                recipientEmail
            ]
        },
        ReplyToAddresses: [],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: body
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject
            }
        }
    }

    const sendEmailCommand = new SendEmailCommand(params);
    const res = await sesClient.send(sendEmailCommand);
}