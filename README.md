
# Prática Serverless : AWS SQS

O Amazon Simple Queue Service (AWS SQS) é um serviço de fila de mensagens gerenciado pela Amazon Web Services (AWS). Ele permite que você envie, armazene e receba mensagens entre diferentes componentes de uma aplicação ou sistemas distribuídos de maneira assíncrona e segura.

O AWS SQS pode ser usado em uma variedade de casos de uso, incluindo processamento de pedidos, geração de relatórios, processamento de dados em lote, aplicativos de streaming e muito mais. Com o SQS, as aplicações podem ser projetadas para serem escaláveis, distribuídas e resilientes, garantindo a entrega de mensagens em todas as circunstâncias e permitindo que as aplicações sejam desenvolvidas e implantadas com mais facilidade e confiabilidade.




## Sistema de vendas
Para fornecer uma analogia realista para o uso do serviço AWS SQS, vamos pensar em um sistema de vendas online de uma loja que vende produtos eletrônicos. Quando um cliente faz um pedido online, o sistema precisa gerenciar o fluxo de pedidos, para que os pedidos sejam processados ​​de maneira eficiente e entregues aos clientes dentro do prazo.

Uma abordagem para gerenciar o fluxo de pedidos é usando o AWS SQS. O sistema pode usar uma fila para armazenar os pedidos recebidos dos clientes e, em seguida, processar esses pedidos de maneira assíncrona e em paralelo. Isso garante que cada pedido seja processado em uma ordem justa e que não ocorra atraso em nenhum pedido.

Vamos agora implementar um exemplo básico do uso do AWS SQS em Node.js. Neste exemplo, vamos criar uma fila SQS e enviar uma mensagem para a fila. Em seguida, no background vamos ler a mensagem da fila.

Para utilizar o serviço SQS siga os passos:
- Cire sua conta na AWS : [link](https://portal.aws.amazon.com/billing/signup#/start/otp)
- Crie uma fila : [link](https://us-east-2.console.aws.amazon.com/sqs/v2/home?region=us-east-2#/)
![Fila](https://i.ibb.co/hfPqk6S/criar-Fila-Correto.jpg)
https://us-east-1.console.aws.amazon.com/billing/home#/account

- Gere sua chave de acesso que serão utilizadas dentro do codigo : [link](https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/security_credentials)

- Clone o repositorio e rode o seguinte comando:
```bash
  npm i
```
- Substitua os valores das variáveis que iniciam com '#' no arquivo sqsService.js, com os dados sobre a fila e sua chave de acesso e rode o seguinte comando:

```bash
  npm start
```
No arquivo index.js é responsável por adicionar os elementos na fila, no nosso caso, os pedidos dos clientes para serem processados futuramente. Realizando a seguinte requisição:

```bash
curl --location 'localhost:3000/orders' \
--header 'Content-Type: application/json' \
--data '{
    "productid":"1",
    "price":"15,90",
    "description":"A blue book"
}'
```
É adicionado um pedido de um cliente, todas requisições nesse endpoint irão adicionar os dados passados no body da requisição na fila de pedidos.
Analise o codigo para ver como é realizado a integração com o SQS para adicionar o dado passado à fila.

Agora precisamos criar nosso worker para processar as mensagens que estão na fila. Para isso crie um arquivo chamado background.js. Chame ele no começo do arquivo index.js adicionando a seguinte linha:
```bash
require('./background');
```
Queremos que a cada 30 segundos caso exista uma mensagem na fila, esta seja retirada da fila e processada, para isso utilizaremos o  cron job que é um agendador de tarefas.
Adiciona as seguintes linhas dentro do arquivo background:

```bash
const { sqs, queueUrl } = require('./sqsService');
const cron = require("node-cron");

cron.schedule("*/30 * * * * *", () => unqueue());
```
Agora iremos criar a funcao que irá retirar os pedidos da fila, a função 'unqueue'.
Adicicione o seguinte codigo no final do arquivo:
```bash
const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    VisibilityTimeout: 30
};

const unqueue = () => {
    sqs.receiveMessage(params, (err, data) => {
        if (err) {
            console.log(err, err.stack);
        } else {
            if (!data.Messages) {
                return;
            }

            const orderData = JSON.parse(data.Messages[0].Body);
            console.log('Order recebida para ser processada', orderData);

            const deleteParams = {
                QueueUrl: queueUrl,
                ReceiptHandle: data.Messages[0].ReceiptHandle
            };
            sqs.deleteMessage(deleteParams, (err, data) => {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log('Sucesso ao processar e excluir order da fila');
                }
            });
        }
    });
}
```
Com isso a cada 30 segundos caso exista algum pedido na fila, este será processado.

Você pode criar uma propriedade state por exemplo ao body do pedido e tomar decisões diferentes quando retirar da fila. 

Para praticar o uso da SQS , adicione 2 estados possíveis a um pedido : 'novo' e 'a enviar'. Quando ao retirar um pedido da fila e seu estado for novo, altere seu estado para 'a enviar' e o adicione novamente na fila. Se o estado de um pedido for 'a enviar' o retire da fila de pedidos.




