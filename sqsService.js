const AWS = require('aws-sdk');
const https = require('https');

const accountId = '#SUA_ACCOUNT_ID';
const queueName = '#SUA_FILA.fifo';
const region = "#REGION"
AWS.config.update({
    accessKeyId: '#SEU_ACCESSKEYID',
    secretAccessKey: '#SEU_SECRETACCESSKEY',
    region: region
});



module.exports={
    sqs:new AWS.SQS({
        apiVersion: '2012-11-05', httpOptions: {
            agent: new https.Agent({ rejectUnauthorized: false })
        }
    }),
    queueUrl:`https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`
}
