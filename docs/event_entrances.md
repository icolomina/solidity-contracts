# Event Entrance Contract

## Overview
This contract is a simple implementation of an event entrance system using ERC-1155 tokens. It allows for different types of entrance tickets to be minted and transferred.

## Variables
**VIP_ENTRANCE**, **GOLD_ENTRANCE**, **SILVER_ENTRANCE**, **GENERAL_ADMISSION_ENTRANCE**, and **EARLY_BIRD_ENTRANCE** are public constant variables representing the different types of entrance tickets.

## Functions

### Constructor
The constructor initializes the contract by minting a certain number of each entrance ticket type to the contract creator. Then, when a payment is done within a dApp, the contract owner can transfer the entrance to the new owner.

