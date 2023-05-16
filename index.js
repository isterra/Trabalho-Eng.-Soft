const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const { sqs ,queueUrl} = require('./sqsService');


const app = express()
app.use(bodyParser.json())

app.post('/orders', (req, res) => {
  const order = req.body
  queueOrder(order)
  res.send("Mensagem adicionada a fila")
})


const queueOrder = (order) => {
  console.log("Order recebida da api:");
  console.log(order);
  const params = {
    MessageBody: JSON.stringify(order),
    MessageGroupId:"oders",
    MessageDeduplicationId:uuid.v4(),
    QueueUrl: queueUrl,

  };
  sqs.sendMessage(params, (err, data) => {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Mensagem adicionada com sucesso", data.MessageId);
      return data.MessageId
    }
  });
}

app.listen(3000)