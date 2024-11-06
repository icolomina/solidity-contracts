// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title An Event Entrance Contract
/// @author Ignacio Colomina
/// @notice This contract is an ERC1155 multitoken contract that manages 5 event entrance tokens
contract EventEntrance is ERC1155, Ownable {

    uint16 public constant VIP_ENTRANCE = 1;
    uint16 public constant GOLD_ENTRANCE = 2;
    uint16 public constant SILVER_ENTRANCE = 3;
    uint16 public constant GENERAL_ADMISSION_ENTRANCE = 4;
    uint16 public constant EARLY_BIRD_ENTRANCE = 5;

    constructor() ERC1155("http://available_entrances_types_{id}.json") Ownable(msg.sender) {
        _mint(msg.sender, VIP_ENTRANCE, 50, "");
        _mint(msg.sender, GOLD_ENTRANCE, 100, "");
        _mint(msg.sender, SILVER_ENTRANCE, 200, "");
        _mint(msg.sender, GENERAL_ADMISSION_ENTRANCE, 300, "");
        _mint(msg.sender, EARLY_BIRD_ENTRANCE, 60, "");
    }
}