How to run ganache with a db: 
```
ganache-cli --db ./chain/
```

The index.js of the Executor contains one rpc methog: eth_sendRawTransactions. This is the curl command:

for eth_sendRawTransaction
`curl -XPOST -H "content-type: application/json" http://localhost:8081/json-rpc --data '{"jsonrpc":"2.0","method":"sendContractAddress","params": "address","id":1}'`

## Docker-Compose

just run `docker-compose up -d` in the root folder of the project. Once all container started, execute the curl command.