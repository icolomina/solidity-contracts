# Payment Orders contracts

## Overview
The Payment Order contracts show two ways fo managing payment orders between a crediter and a debtor:

- **By crediter**: In this case, a new contract by crediter is deployed and all the payment orders for that crediter are managed by this contract address. This reduces the number of deployed contracts and the GAS costs too, but it requires more code to store and manage the orders. This can be useful for dApps with a high volume of operations.

- **By order**: In this case, a new contract is deployed for each order and, as the contract address only manages a single order, it requires little code to work. On the other hand, this contract would not be suitable for high volume dApps as it would require the deployment of too many contracts.

## Table of Contents
- [Payment Contract By Crediter](./payment_order/payment_contract_by_crediter.md#overview)
    - [Variables](./payment_order/payment_contract_by_crediter.md#variables)
    - [Events](./payment_order/payment_contract_by_crediter.md#events)
    - [Structs](./payment_order/payment_contract_by_crediter.md#structs)
    - [Modifers](./payment_order/payment_contract_by_crediter.md#modifier)
    - [Functions](./payment_order/payment_contract_by_crediter.md#functions)
        - [Constructor](./payment_order/payment_contract_by_crediter.md#constructor)
        - [Create Payment Order](./payment_order/payment_contract_by_crediter.md#createpaymentorder)
        - [Pay](./payment_order/payment_contract_by_crediter.md#pay)
        - [Reception Confirmation](./payment_order/payment_contract_by_crediter.md#received)
        - [Get Order State](./payment_order/payment_contract_by_crediter.md#getorderstate)
- [Payment Contract By Order](./payment_order/payment_contract_by_order.md#overview)
    - [Variables](./payment_order/payment_contract_by_order.md#variables)
    - [Events](./payment_order/payment_contract_by_order.md#events)
    - [Functions](./payment_order/payment_contract_by_order.md#functions)
        - [Constructor](./payment_order/payment_contract_by_order.md#constructor)
        - [Pay](./payment_order/payment_contract_by_order.md#pay)
        - [Confirm reception](./payment_order/payment_contract_by_order.md#received)
        - [Get status](./payment_order/payment_contract_by_order.md#getstate)