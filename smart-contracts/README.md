# Token Bank

Token Bank is a simple blockchain application that provides users with the ability to deposit and withdraw any particular ERC20 token as well as the native network token.

## Contracts
- *TokenBank.sol*:
- *forge-std/src/interfaces/IERC20.sol*

## Deployed Contracts

- **Base**: [TokenBank on Base](https://basescan.org/address/0x3e01a0f684c0b3af7b5a151cb0958b01b082bef8)
- **Seplolia**: [TokenBank on Sepolia](https://sepolia.etherscan.io/address/0x155B79d1Aa17e021bD495f99305aC2DeDEe958de)


## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
