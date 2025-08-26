# ERC998 - Composable NFTs (Solidity 0.8.28)

[![Build & Test Smart Contracts](https://github.com/maxnorm/composable-nft-erc998/actions/workflows/build_test_smart_contract.yml/badge.svg)](https://github.com/maxnorm/composable-nft-erc998/actions/workflows/build_test_smart_contract.yml)
[![Solidity Version](https://img.shields.io/badge/solidity-0.8.28-blue.svg)](https://soliditylang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26.1-orange.svg)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.4.0-green.svg)](https://openzeppelin.com/)


## Overview

ERC998 enables **Composable NFTs (cNFTs)**. NFTs that can own other NFTs, creating hierarchical ownership structures. 

This implementation is built for Solidity 0.8.28 with modern security practices, based on the [EIP-998 specification](https://eips.ethereum.org/EIPS/eip-998).

### Key Benefits
- **Hierarchical ownership**: NFTs can own other NFTs and ERC20 tokens
- **Safe transfers**: Built-in security mechanisms with reentrancy protection
- **Gas optimized**: Efficient child management with depth limiting
- **Standards compliant**: Follows EIP-998 specification
- **Modern Solidity**: Built with Solidity 0.8.28 and OpenZeppelin 5.4.0

### Articles
- [Composable NFTs: Unlocking Complex Asset Management](https://medium.com/@m.n.0/composable-nfts-unlocking-complex-asset-management-e258189085d8)

##  Architecture

![Architecture](./docs/assets/erc998-diagram.png)

### Core Components
- **[ERC998.sol](./contracts/ERC998.sol)** - Main composable NFT contract
- **[IERC998ERC721TopDown.sol](./contracts/interface/IERC998ERC721TopDown.sol)**: Interface for ERC721 child management
- **[IERC998ERC20TopDown.sol](./contracts/interface/IERC998ERC20TopDown.sol)**: Interface for ERC20 child management
- **[IERC998ERC721TopDownEnumerable.sol](./contracts/interface/IERC998ERC721TopDownEnumerable.sol)**: Enumerable interface for ERC721
- **[IERC998ERC20TopDownEnumerable.sol](./contracts/interface/IERC998ERC20TopDownEnumerable.sol)**: Enumerable interface for ERC20

## Features

### NFT Management
- **Child Addition/Removal** - Add and remove child NFTs safely
- **Hierarchical Transfers** - Transfer child NFTs between parent NFTs
- **Root Owner Tracking** - Efficient root ownership identification
- **ERC721 Receiver** - Compliant with ERC721 transfer standards

### Token Support
- **ERC20 Integration** - Support for ERC20 tokens as child assets
- **Balance Management** - Track ERC20 balances per NFT
- **Safe Transfers** - Use OpenZeppelin's SafeERC20 for token operations

### Security Features
- **Reentrancy Protection** - Built with OpenZeppelin's ReentrancyGuard
- **Safe Transfer Mechanisms** - Prevents accidental loss of child NFTs
- **Depth Limiting** - Maximum nesting depth of 100 to prevent gas issues
- **Access Control** - Owner-only operations with proper validation


##  Quick Start

### Prerequisites
- Node.js >= 16
- npm or yarn
- [MetaMask wallet](https://metamask.io/) or other Ethereum wallet

### Installation
```bash
# Clone the repository & install dependencies
git clone https://github.com/maxnorm/composable-nft-erc998.git
cd composable-nft-erc998

npm install

# Compile contracts
npx hardhat compile
```

## Testing

The project includes comprehensive tests covering all major functionality:

```bash
npx hardhat test
npx hardhat coverage
```
### Test Coverage
- **Deployment** - Contract deployment and initialization
- **Child Management** - Adding, removing, and transferring child NFTs
- **ERC20 Integration** - Token balance management and transfers
- **Security** - Access control and edge case handling

## Usage Examples

### Basic Implementation
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ERC998.sol";

contract MyComposableNFT is ERC998 {
    constructor() ERC998("MyComposable", "MCN") {}
    
    // Your custom logic here
}
```



## Deployment

### Local Development
```bash
# Start local blockchain (in another terminal)
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost
```

## Security Considerations

### Built-in Protections
- **Reentrancy Guard** - Prevents reentrancy attacks
- **Depth Limiting** - Maximum nesting depth of 100 (this can be increased if needed, but be careful with gas costs for deep hierarchies)
- **Safe Transfer Standards** - Uses OpenZeppelin's safe transfer functions
- **Use of OpenZeppelin Contracts** - Battle-tested and audited

## 📖 References & Resources
- [EIP-998](https://eips.ethereum.org/EIPS/eip-998)
- [ERC998 Issue](https://github.com/ethereum/EIPs/issues/998)
- [ERC998.org](https://erc998.org/)
- [Original ERC998 Implementation](https://github.com/mattlockyer/composables-998)
- [ERC721](https://eips.ethereum.org/EIPS/eip-721)
- [ERC20](https://eips.ethereum.org/EIPS/eip-20)
- [ERC6059](https://eips.ethereum.org/EIPS/eip-6059)
- [ERC6059 Implementation](https://github.com/ethereum/ERCs/blob/master/assets/erc-6059/contracts/NestableToken.sol)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)



### **Built with ❤️ for the Ethereum family**

### Authors
[@maxnorm](https://github.com/maxnorm)

*Special thanks to the original ERC998 & ERC6059 contributors for laying the foundation for composable NFTs.*

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
Authors are not liable for any losses or damages incurred from the use of this code in any way. Use at your own risk!