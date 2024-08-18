import { Twilio } from 'twilio';

export const sendSMS = async (phoneNumber: string, message: string) => {
    try {

      const accountSid = process.env.TWILIO_ACCOUNT_SID || "ACb71dfc6969c9f60ba119312ba9f421e2";
      const authToken = process.env.TWILIO_AUTH_TOKEN || "04c96255a4fb882b772872385b6b1187";
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+15179956894";

      const client = new Twilio(accountSid, authToken);

      const smsResponse = await client.messages.create({
        from: twilioPhoneNumber,
        to: phoneNumber,
        body: message,
      });

      // const  smsResponse  = {
      //   body: 'Sent from your Twilio trial account - 713461',
      //   numSegments: '1',
      //   direction: 'outbound-api',
      //   from: '+15179956894',
      //   to: '+923137701590',
      //   dateUpdated: "2023-09-23T12:26:41.000Z",
      //   price: null,
      //   errorMessage: null,
      //   uri: '/2010-04-01/Accounts/ACb71dfc6969c9f60ba119312ba9f421e2/Messages/SM76a5a03994b90ec3f0e27e7ae1579639.json',
      //   accountSid: 'ACb71dfc6969c9f60ba119312ba9f421e2',
      //   numMedia: '0',
      //   status: 'queued',
      //   messagingServiceSid: null,
      //   sid: 'SM76a5a03994b90ec3f0e27e7ae1579639',
      //   dateSent: null,
      //   dateCreated: "2023-09-23T12:26:41.000Z",
      //   errorCode: null,
      //   priceUnit: 'USD',
      //   apiVersion: '2010-04-01',
      //   subresourceUris: {
      //     media: '/2010-04-01/Accounts/ACb71dfc6969c9f60ba119312ba9f421e2/Messages/SM76a5a03994b90ec3f0e27e7ae1579639/Media.json'
      //   },
      //   tags: undefined
      // }
        
      return smsResponse;
    } catch (error) {
        console.log('twilio error', error);
      error.statusCode = 400;
      throw error;
    }
  };