// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract PledgeLoan is Ownable {

    address public debtor;
    address public creditor;
    IERC721 public collateralToken;
    IERC20 public paymentToken;

    uint256 public collateralId;
    uint16 public monthlyPayment;
    uint16 public totalPayments;
    uint16 public paymentsMade;
    uint256 public loanStartTime;
    uint256 public nextPaymentTime;
    uint256 public paymentInterval;

    mapping(address => bool) public approvals;
    uint16 totalApprovals;
    address[] signers;

    enum LoanState { Reviwing, Active, Repaid, Defaulted }
    LoanState public loanState;

    event LoanStarted(uint256 indexed collateralId, uint256 loanStartTime, uint256 monthlyPayment, uint256 totalPayments);
    event PaymentMade(uint256 indexed paymentNumber);
    event LoanRepaid();
    event LoanDefaulted();

    modifier isSigner() {
        bool isSign = false;
        uint16 counter = 0;
        while(!isSign && counter < signers.length) {
            isSign = (signers[counter] == msg.sender);
            counter++;
        }

        require(isSign, 'The sender is not a valid signer');
        _;

    }

    constructor(address _collateralToken, uint256 _collateralId, address _paymentToken, address _debtor, address _creditor, uint16 _months, uint16 _monthlyPayment) Ownable(msg.sender)
    {
        collateralToken = IERC721(_collateralToken);
        collateralId = _collateralId;
        paymentToken = IERC20(_paymentToken);
        debtor = _debtor;
        creditor = _creditor;
        monthlyPayment = _monthlyPayment;
        totalPayments = _months;
        paymentsMade = 0;
        paymentInterval = 30 days;
        totalApprovals = 0;
        loanState = LoanState.Reviwing;

        signers.push(owner());
        signers.push(debtor);
    }

    function startLoan() external onlyOwner
    {
        require(collateralToken.ownerOf(collateralId) == debtor, 'Debtor must be the collaeral provider before starting the loan');
        require(collateralToken.getApproved(collateralId) == address(this) , 'Contract must have been approved to move collateral from debtor to another address');
        collateralToken.transferFrom(debtor, creditor, collateralId);
        loanState = LoanState.Active;
        loanStartTime = block.timestamp;
        nextPaymentTime= loanStartTime + 30 days;
        emit LoanStarted(collateralId, monthlyPayment, loanStartTime, totalPayments);
    }

    function approveNextPayment() isSigner() external 
    {
        require(loanState == LoanState.Active, "Loan is not active");
        require(paymentsMade < totalPayments, "All payments have been made");
        require(block.timestamp >= nextPaymentTime, 'The next payment time has not arrived yet');
        require(approvals[msg.sender] == false, 'Signer has already approved the payment');
        require(paymentToken.allowance(debtor, address(this)) >= monthlyPayment, 'Debtor must have been approved contract to transfer its ERC 20 tokens');

        approvals[msg.sender] = true;
        totalApprovals++;
        if(totalApprovals >= 2) {
            makePayment();
            totalApprovals = 0;
            resetApprovals();
            nextPaymentTime = block.timestamp + 30 days;
        }

    }

    function declareDefault() external onlyOwner(){
        require(loanState == LoanState.Active, "Loan is not active");
        require(block.timestamp > nextPaymentTime, "Loan cannot be defaulted yet");

        loanState = LoanState.Defaulted;
        emit LoanDefaulted();
    }   

    function getPaymentsMade() external view returns(uint16) {
        return paymentsMade;
    }

    function getStatus() external view returns(LoanState) {
        return loanState;
    }

    // Internal Functions

    function makePayment() internal {
        paymentToken.transferFrom(debtor, creditor, monthlyPayment);
        paymentsMade++;

        emit PaymentMade(paymentsMade);
        
        if (paymentsMade == totalPayments) {
            loanState = LoanState.Repaid;
            collateralToken.transferFrom(creditor, debtor, collateralId);
            emit LoanRepaid();
        }
    }

    function resetApprovals() internal {
        for (uint16 i = 0; i < signers.length; i++) {
            approvals[signers[i]] = false;
        }
    }
}