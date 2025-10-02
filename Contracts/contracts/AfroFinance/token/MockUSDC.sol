// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    constructor(
        address initialRecipient,
        uint256 initialSupply
    ) ERC20("HUSDC", "HUSDC") Ownable() {
        _mint(initialRecipient, initialSupply);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
