//SPDX-License-Identifier: PENDING

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NewToken is ERC20{

    constructor(uint tokenNumber, string memory name, string memory symbol) ERC20(string(abi.encodePacked("dstate-", name)), symbol) {
        _mint(msg.sender,tokenNumber*10**18);
    }
}