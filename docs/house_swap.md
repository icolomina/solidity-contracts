# HouseSwap Smart Contract

The **HouseSwap** smart contract is designed to facilitate the swap of house assets between two parties. It allows users to create and accept offers, make payments, and perform the actual swap of the house assets.

## Table of Contents
- [HouseSwap Smart Contract](#houseswap-smart-contract)
  - [Table of Contents](#table-of-contents)
  - [Contract Structure](#contract-structure)
  - [Enums](#enums)
  - [Structs](#structs)
  - [Events](#events)
  - [Modifiers](#modifiers)
  - [Functions](#functions)
    - [Constructor](#constructor)
    - [addOffer](#addoffer)
    - [declineOffer](#declineoffer)
    - [acceptOffer](#acceptoffer)
    - [payFromTargetToOrigin](#payfromtargettoorigin)
    - [payFromOriginToTarget](#payfromorigintotarget)
    - [performSwap](#performswap)
    - [getStatus](#getstatus)
    - [getSwapOffers](#getswapoffers)

## Contract Structure

The **HouseSwap** contract imports two external contracts: **IERC20** from OpenZeppelin and **HouseAsset**.

The contract has the following state variables:
- **houseAsset**: An instance of the **HouseAsset** contract.
- **paymentToken**: An instance of the **IERC20** contract, used for token payments.
- **originOwner**: The address of the original owner of the house asset.
- **contractOwner**: The address of the contract owner.
- **targetOwner**: The address of the target owner of the house asset.
- **originTokenId**: The token ID of the original house asset.
- **targetTokenId**: The token ID of the target house asset.
- **amountPayOriginToTarget**: The amount the original owner must pay to the target owner.
- **amountPayTargetToOrigin**: The amount the target owner must pay to the original owner.
- **originApprovedContractOwner**: A flag indicating whether the original owner has approved the contract owner.
- **targetApprovedContractOwner**: A flag indicating whether the target owner has approved the contract owner.
- **status**: The current status of the contract.
- **swapOffers**: A mapping of token IDs to **Offer** structs, representing the available swap offers.
- **swapOffersSize**: The number of swap offers.

## Enums

The contract defines the following enum:
- **Statuses**: Represents the different stages of the contract, including **INITIALIZED**, **ACCEPTED**, **PAID**, and **SWAPPED**.

## Structs

The contract defines the following struct:
- **Offer**: Represents a swap offer, containing the token ID, token URI, amount the original owner must pay to the target owner (can be 0), and amount the target owner must pay to the original owner (can be 0).

## Events

The contract defines the following events:
- **NewOffer**: Emitted when a new swap offer is added.
- **BalanceUpdated**: Emitted when the balance of a user is updated.

## Modifiers

The contract defines the following modifiers:
- **hasToBeInStatus**: Checks that the contract is in the specified status.
- **isContractOwner**: Checks that the caller is the contract owner.
- **isOriginOwner**: Checks that the caller is the original owner.
- **isTargetOwner**: Checks that the caller is the target owner.
- **targetCanPay**: Checks that the target owner must pay the required amount to the original owner.
- **originMustPay**: Checks that the original owner must pay the required amount to the target owner.
- **paymentMustBeCompleted**: Checks that the payment has been completed.

## Functions

### Constructor

The **constructor** function initializes the contract with the **HouseAsset** and **IERC20** contract addresses, as well as the original token ID.

### addOffer

The **addOffer** function allows the target owner to add a new swap offer. The function checks that the contract is in the **INITIALIZED** status and that the target token ID is greater than 0 and different from the original token ID. If the conditions are met, the function creates a new **Offer** struct and adds it to the **swap

### declineOffer

The **declineOffer** function allows the owner to decline an offer and remove it from te offers mapping. The function checks that the contract is in the **INITIALIZED** state.

### acceptOffer

The **acceptOffer** function allows the owner to accept an offer. Once an offer is accepted the contract state can become: 

- **ACCEPTED**: If the one of the actors must send a payment to the other.
- **PAID**: If no payment must be performed.

The function checks that the contract is in the **INITIALIZED** state and only the origin asset owner can perform this function. The received token ID (the token accepted for the swap) must be greater than 0 and cannot be the same as the original token id (the token offered within the contract deployment).

### payFromTargetToOrigin

The **payFromTargetToOrigin** sends the payment from the target address to the origin address if the **amountPayTargetToOrigin** is greater than 0. This function can only be called by the target owner and the contract stage must be "ACCEPTED". After the payment is completed, the contract status changes to PAID.

### payFromOriginToTarget

The **payFromOriginToTarget** sends the payment from the target address to the origin address if the **amountPayOriginToTarget** is greater than 0. This function can only be called by the origin owner and the contract stage must be "ACCEPTED". After the payment is completed, the contract status changes to PAID.

### performSwap

The **performSwap** function changes the origin token owner and target token owner so that:

- Target becomes the origin owner.
- origin becomes the target owner.

Once the swap is done, the contract status changes to "SWAPPED". This funcion can only be called by the contract owner and the payment must have been completed.

### getStatus

This is a view function that returns the current contract status. It does not modify the contract

### getSwapOffers

This is a view function that returns the current contract offers. It does not modify the contract