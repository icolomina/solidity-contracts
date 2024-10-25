// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ERC-20 interace
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// Uncomment this line to use console.log
 // import "hardhat/console.sol";

contract PayContractByOrder {
    
    enum State { PENDING, PAID, FUNDS_RECEIVED }
    
    address payable creditor;
    address debtor;
    address tokenERC20;
    State state;
    uint256 amount;


    event PaymentReceived(address debtor, uint256 amount);
    event FundsReceived(address creditor, uint256 amount);

    constructor(address _debtor, address _tokenERC20) payable {
        creditor = payable(msg.sender); 
        debtor = _debtor;
        amount = msg.value; 
        tokenERC20 = _tokenERC20;

        state = State.PENDING; 
    }

    
    function pay() external {
        require(msg.sender == debtor, "Only the debtor can pay");
        require(state == State.PENDING, "The status must be pending");

        IERC20(tokenERC20).transferFrom(debtor, creditor, amount);
        state = State.PAID; 
        emit PaymentReceived(debtor, amount);
    }

    function received() external {
        require(msg.sender == creditor, "Only the creditor can confirm reception");
        require(state == State.PAID, "Order must be PAID");
        state = State.FUNDS_RECEIVED;
        emit FundsReceived(creditor, amount);

    }

    
    function getState() external view returns (State) {
        return state;
    }
}
