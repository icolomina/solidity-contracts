// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ERC-20 interace
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PayContractByCrediter {
    enum State { PENDING, PAID, FUNDS_RECEIVED }

    struct PaymentOrder {
        address debtor;
        uint256 amount;
        address tokenERC20;
        State state;
    }

    address payable creditor;
    mapping(string => PaymentOrder) public paymentOrders;

    event PaymentOrderCreated(address debtor, uint256 amount, string indexed orderId);
    event PaymentOrderReceived(address debtor, uint256 amount, string indexed orderId);
    event FundsOrderReceived(address creditor, uint256 amount, string indexed orderId);

    /**
     * The creditor is who deploys the contract
     */
    constructor() {
        creditor = payable(msg.sender); 
    }

    /**
     * Creates a payment order. Inserts the paymentOrder in the mapping and emits a PaymentOrderCreated event 
     *   - Both debtor and token cannot be 0 address
     *   - Amount must be greater than 0
     *   - Sender address must be the creditor
     */
    function createPaymentOrder(address debtor, string memory orderId, uint256 amount, address tokenERC20) external {
        require(msg.sender == creditor, "Only the creditor can create payment orders");
        require(amount > 0, "Amount to pay must be greater than 0");
        require(address(0) != debtor, "Debtor cannot be address 0");
        require(address(0) != tokenERC20, "Token ERC20 cannot be address 0");

        paymentOrders[orderId] = PaymentOrder({
            debtor: debtor,
            amount: amount,
            tokenERC20: tokenERC20,
            state: State.PENDING
        });

        emit PaymentOrderCreated(debtor, amount, orderId);
    }

    /**
     * Pay order. Tranfer funds from the debtor to the contract using the IERC20 transferFrom function. Must be approved previously
     * After paid, it changes to PAID status
     *    - Only the order registered debtor can send the payment
     *    - The Payment order must hold the PENDING status
     *    - The debtor must hold enougth balance to pay the order
     */
    function pay(string memory orderId) external {
        PaymentOrder storage order = paymentOrders[orderId];
        require(msg.sender == order.debtor, "Only the debtor can send thge payment");
        require(order.state == State.PENDING, "The state must be pending");
        require(IERC20(order.tokenERC20).balanceOf(order.debtor) >= order.amount, "The debtor must hold enought balance");

        IERC20(order.tokenERC20).transferFrom(msg.sender, creditor, order.amount);
        order.state = State.PAID; // Cambiar el estado a PAID
        emit PaymentOrderReceived(order.debtor, order.amount, orderId);
    }

    /**
     * The creditor confirms he's received an order payment
     *   - The sender must be the creditor
     *   - The order status must be PAID
     */
    function received(string memory orderId ) external {
        require(msg.sender == creditor, "Only the creditor can confirm reception");
        PaymentOrder storage order = paymentOrders[orderId];
        require(order.state == State.PAID, "Order must be PAID");
        order.state = State.FUNDS_RECEIVED;
        emit FundsOrderReceived(creditor, order.amount, orderId);

    }

    /**
     * Get an order state
     */
    function getOrderState(string memory orderId) external view returns (State) {
        return paymentOrders[orderId].state;
    }
}
