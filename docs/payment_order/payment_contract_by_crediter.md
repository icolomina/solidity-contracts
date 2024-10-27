# PayContractByCrediter

## Overview
This contract facilitates the payment of debts between a creditor and debtor using ERC-20 tokens. Once deployed, all the crediter order must be managed by this contract.

## Variables

- **creditor**: The address of the contract deployer, who is the creditor in this context.
- **paymentOrders**: A mapping of payment order IDs to [PaymentOrder](#structs) structs, which contain information about each payment order.

## Events

- **PaymentOrderCreated**: Emitted when a new payment order is created.
- **PaymentOrderReceived**: Emitted when a debtor sends a payment for a payment order.
- **FundsOrderReceived**: Emitted when the creditor confirms receipt of a payment.

## Structs

### PaymentOrder
A struct that represents a payment order. It contains the following fields:
  - **debtor**: The address of the debtor.
  - **amount**: The amount of tokens to be paid.
  - **tokenERC20**: The address of the ERC-20 token contract.
  - **state**: The current state of the payment order.

## Modifiers

### onlyCreditor 
A modifier that ensures that only the contract deployer (the creditor) can call the function.

## Functions

### Constructor
The constructor function, which sets the **creditor** variable to the contract deployer's address.

### createPaymentOrder
Creates a new payment order with the given parameters. Only the creditor can call this function.

### pay
Allows the debtor to send a payment for a specific payment order. The debtor must have approved the contract to transfer the required amount of tokens from their account.

### received
Allows the creditor to confirm that they have received a payment for a specific payment order.

### getOrderState
Returns the current state of a specific payment order.
