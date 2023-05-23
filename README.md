# Arquitetura Serverless: Introdução

Arquitetura serverless é um modelo de desenvolvimento em nuvem, onde os desenvolvedores conseguem criar e gerenciar aplicações sem ter que se preocupar em gerenciar servidores, já que o próprio provedor do serviço realiza essa tarefa. Com isso, os desenvolvedores podem focar mais no desenvolvimento do código, sem ter que se preocupar com a infraestrutura. Então a única coisa que os desenvolvedores precisam fazer é desenvolver o código para a aplicação e implantá-lo em containers que são gerenciados pelo provedor de serviço de nuvem. Além disso, um dos principais diferenciais do Serverless é que é preciso pagar apenas a capacidade que a aplicação utilizar, e os recursos são alocados dinamicamente quando necessário, sendo assim não é cobrado por capacidade ociosa.

## Vantagens do Serverless

• Maior Produtividade: Com serverless, os desenvolvedores podem focar apenas em desenvolver o código sem ter que se preocupar com o gerenciamento da infraestrutura. Sendo assim, sobra muito mais tempo para inovar e aperfeiçoar as funcionalidades da aplicação.

• Redução de custos: Só é necessário pagar pelos recursos que a aplicação utilizar, sendo assim não paga-se por tempo ocioso, que é um problema que ocorre em máquinas virtuais.

• Desenvolvimento em qualquer linguagem: Serverless é um ambiente bem flexível, sendo assim é possível desenvolver na linguagem que acharmos melhor.

• Escalabilidade: A aplicação tem uma maior escalabilidade com o uso de Serverless.

# Uso Real : AWS Lambda

Um exemplo de uso real do AWS Lambda é o processamento de arquivos. Suponha que exista um aplicativo de compartilhamento de fotos. As pessoas usam esse aplicativo para fazer upload de fotos e o aplicativo armazena essas fotos dos usuários no bucket do Amazon S3. Em seguida, o aplicativo cria uma versão em miniatura de cada foto e as exibe na página de perfil do usuário. Neste cenário, o desenvolvedor pode optar por criar uma função do Lambda que cria uma miniatura automaticamente. O Amazon S3 é uma das fontes de eventos da AWS compatíveis que pode publicar eventos criados por objetos e invocar a função do Lambda. Seu código de função do Lambda pode ler o objeto da foto do bucket do S3, criar uma versão em miniatura e salvá-la em outro bucket do S3.

Alguns outros casos de uso comuns do AWS Lambda incluem:
Dados e análise: suponha que você está criando um aplicativo de análise e armazenando dados brutos em uma tabela do DynamoDB. Quando você gravar, atualizar ou excluir itens em uma tabela, os DynamoDB Streams poderão publicar eventos de atualização do item para um fluxo associado à tabela. Neste caso, os dados de eventos fornecem a chave de item, o nome do evento (como, inserir, atualizar e excluir) e outros detalhes relevantes. Você pode escrever uma função do Lambda para gerar métricas personalizadas, agregando dados brutos.

Sites: suponha que você esteja criando um site e deseja hospedar a lógica de backend no Lambda. Você pode invocar sua função do Lambda pelo HTTP usando o Amazon API Gateway como o endpoint HTTP. Agora, o cliente Web pode invocar a API e o API Gateway pode encaminhar a solicitação para o Lambda.

Aplicações móveis: suponha que você tem uma aplicação móvel personalizada que produz eventos. Você pode criar uma função do Lambda para processar eventos publicados pela sua aplicação personalizada. Por exemplo, você pode configurar uma função do Lambda para processar os cliques na aplicação móvel personalizada.


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




