// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ERC998} from "../ERC998.sol";

contract SampleERC998 is ERC998 {
    uint256 private _count;

    constructor() ERC998("SampleERC998", "S-ERC998") {}

    function mint(address to) external returns (uint256) {
        _count++;
        _mint(to, _count);
        return _count;
    }
}