# PayContractByOrder

## Overview

This contract facilitates the payment of debts between a creditor and debtor using ERC-20 tokens. Unlike the [payContractByCrediter](./payment_contract_by_crediter.md#overview) contract, this contract handles a single order, that is, a contract is deployed for a single payment order.

## Variables

The contract has the following variables:

- **creditor**: The address of the creditor.
- **debtor**: The address of the debtor.
- **tokenERC20**: The address of the ERC-20 token contract.
- **state**: The current state of the contract.
- **amount**: The required amount to be paid.

## Events

The contract emits the following events:

- **PaymentReceived**: Emitted when the debtor pays the required amount.
- **FundsReceived**: Emitted when the creditor confirms the receipt of funds.

## Functions

### Constructor
The constructor receives the crediter and debtor addresses, the amount to pay and the token ERC 2.0 that will be used to trasfer the payment. It sets the contract state as **PENDING** and the contract is ready to transfer the payment.

### pay 
Allows the debtor to pay the required amount. Only the debtor address can call this function and the contract status must be "PENDING". After the payment is transferred, the contract status changes to **PAID** and a **PaymentReceived** event is emitted.

### received
This functions is used by the crediter to confirm that it has received the payment on its wallet. Only the crediter can call it. After called, the contract status changes to "FUNDS_RECEIVED" and the funcion emits a **FundsReceived** event.

### getState 
This is a view function that returns the current state of the contract.
