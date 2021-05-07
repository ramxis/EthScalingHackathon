How to run ganache with a db: 
```
ganache-cli --db ./chain/
```

The index.js of the Executor contains one rpc methog: eth_sendRawTransactions. This is the curl command:

for eth_sendRawTransaction
`curl -XPOST -H "content-type: application/json" http://localhost:8080/json-rpc --data '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params": ["0xf867808082520894036d0e47e9844e6d0fb5bd104043599f889fc215880de0b6b3a7640000801ca08095e722b96d9f13f3bf5ac997d7cedbd2c0f82295d47b770faad526b4e7e519a05262eef932e223130d1f72664162b897c6129f0164e0806ed959b9abd6f23a39"],"id":1}'`

## Docker-Compose

just run `docker-compose up -d` in the root folder of the project. Once all container started, execute the curl command.

curl -XPOST -H "content-type: application/json" http://localhost:8080/json-rpc --data '{"jsonrpc":"2.0","method":"test","params": [],"id":1}'