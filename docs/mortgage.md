# Mortgage contract

## Overview
This smart contract represents a unique mortgage token on the Ethereum blockchain. It is built using the ERC721 standard for non-fungible tokens, with additional features for managing mortgage payments. The contract includes functionality for setting mortgage parameters, making payments, and tracking payment history.

## Variables
- **mortgageOwner**: The address of the mortgage owner.
- **debtor**: The address of the debtor.
- **mortgagePaymentAmount**: The amount of the mortgage payment.
- **months**: The number of months remaining on the mortgage.
- **daysInterval**: The number of days between mortgage payments.
- **lastTransferTime**: The timestamp of the last mortgage payment.
- **mortgageId**: The unique identifier for the mortgage token.
- **iRateType**: The interest rate type (fixed or variable).
- **paymentToken**: The ERC20 token used for mortgage payments.

## Structs

### Mortgage Info
A struct that represents a the mortgage information. It contains the following fields:

- **remainingMonths**: Number of months remaining to pay the mortgage.
- **mortgagePayment**: Monthly mortgage payment.
- **daysInterval**: Number of days between payments.
- **paymentToken**: Token ERC 20 by which the payments will be trasferred.

## Modifiers

### onlyOwner
A modifier that ensures only the contract owner can call the function.

## Functions

The contract includes the following functions:

### Constructor

The constructor receives and sets the mortgage parameters, assigns the token to the mortgage owner address and sets the token URI.

### setInterval
Sets the payment interval. Only callable by the contract owner.

### setMortgagePaymentAmount
Sets the mortgage payment amount. Only callable by the contract owner.

### setMonths
Sets the number of months remaining on the mortgage. Only callable by the contract owner.

### getMortgageInfo
Returns the mortgage information.

### _transferMortgagePayment
Transfers the mortgage payment from the debtor to the mortgage owner. This is an internal function and cannot be called from the outside world.

### checkUpkeep
Checks whether a mortgage payment is needed. This function is required by the AutomationCompatible chainlink contracts

### performUpkeep
Performs a mortgage payment if needed. This function is also required by the AutomationCompatible chainlink contracts