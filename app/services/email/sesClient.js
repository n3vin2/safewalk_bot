import { SESClient } from "@aws-sdk/client-ses"

const SES_CONFIG = {
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_SES_REGION
};

const sesClient = new SESClient(SES_CONFIG);

export default sesClient;