import sesClient from './sesClient';
import { SendEmailCommand } from '@aws-sdk/client-ses';

export const sendEmail = async (recipientEmail) => {
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
                    Data: "<h1>Email body</h1>"
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Subject"
            }
        }
    }

    try {
        const sendEmailCommand = new SendEmailCommand(params);
        const res = await sesClient.send(sendEmailCommand);
        console.log("Email has been sent!", res);
    } catch (error) {
        console.log(error);
    }
}