How to run ganache with a db: 
```
ganache-cli --db ./chain/
```

index.js contains two rpc methods
echo and log
To curl echo do this: 
`curl -XPOST -H "content-type: application/json" http://localhost/json-rpc --data '{"jsonrpc":"2.0","method":"echo","params": {"text":"Hello, World!"},"id":1}'`

for log do this:
`curl -XPOST -H "content-type: application/json" http://localhost/json-rpc --data '{"jsonrpc":"2.0","method":"log","params": {"message":"Hello, World!"},"id":1}'`

for eth_sendRawTransaction
`curl -XPOST -H "content-type: application/json" http://localhost/json-rpc --data '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params": ["tx1", "tx2"],"id":1}'`