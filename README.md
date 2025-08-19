# ERC998

This is a newer top-down implementation of ERC998 for Solidity 0.8.28, based on the [ERC998](https://github.com/ethereum/EIPs/issues/998) specification and the [proposed implementation](https://github.com/mattlockyer/composables-998/blob/master/contracts/ComposableTopDown.sol) from 2018 in Solidity 0.4.24.


## Articles
- [Composable NFTs: Unlocking Complex Asset Management](https://medium.com/@m.n.0/composable-nfts-unlocking-complex-asset-management-e258189085d8)

## References
- [EIP-998](https://eips.ethereum.org/EIPS/eip-998)
- [ERC998 Issue](https://github.com/ethereum/EIPs/issues/998)
- [ERC998.org](https://erc998.org/)

## Features
- Hierarchical NFT ownership
- Child NFT management
- Safe transfer mechanisms
- Child contract validation

# Getting Started
## Prerequisites
- Node.js >= 16
- npm or yarn
- MetaMask wallet

### Smart Contract
#### 1. Start Local Blockchain & Deploy Contract
```sh
npm install

#Run on a separate terminal
npx hardhat node

# Deploy contract locally
npx hardhat run ./scripts/deploy.ts --network localhost
```

