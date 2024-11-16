import { expect } from "chai";
import { ethers } from "hardhat";
import { HouseAsset, PledgeLoan, TokenERC20 } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Pledge Loan", function () {
    let payContractToken: TokenERC20;
    let collateralToken: HouseAsset;

    let owner: SignerWithAddress;
    let creditor: SignerWithAddress;
    let debtor: SignerWithAddress;  
    let other: SignerWithAddress;

    beforeEach(async function() {
        [owner, creditor, debtor, other] = await ethers.getSigners();
    
        payContractToken = await ethers.deployContract("TokenERC20", ['DollarTest', 'DTS'], owner) as TokenERC20;
        collateralToken  = await ethers.deployContract("HouseAsset", ['MyAsset', 'MYA']) as HouseAsset;
        await collateralToken.assignToken(1, 'https://token.json', await debtor.getAddress());
        await payContractToken.connect(owner).mint(debtor, 250000);
    });

    /**
     * Tests the complete contract flow
     */
    it("PledgedLoan completed successfully", async function () {

        const pledgeLoan = await deployContractAndMakeApprovals();
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(0);

        /**  
            Starts the loan. It emits LoanStarted event
            Now the status is ACTIVE
            The creditor approves the contract to change the ownership of the colleateral. The contract changes it after all payments are made
        */
        expect(await pledgeLoan.connect(owner).startLoan()).to.emit(pledgeLoan, "LoanStarted");
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(1);
        await collateralToken.connect(creditor).approve(await pledgeLoan.getAddress(), 1);

        increaseTimestamp(31);

        /**  
            Owner calls "approveNextPayment". Payments made is still 0 since one signer is missing
            When debtor calls "approveNextPayment", Payment is made since all signers has called the function
            As more payments has to be made, status is still ACTIVE
        */
        await pledgeLoan.connect(owner).approveNextPayment();
        expect(await pledgeLoan.connect(owner).getPaymentsMade()).to.be.equal(0);
        expect(await pledgeLoan.connect(debtor).approveNextPayment()).to.emit(pledgeLoan, "PaymentMade");
        expect(await pledgeLoan.connect(owner).getPaymentsMade()).to.be.equal(1);
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(1);

        increaseTimestamp(31);

        /**  
            Owner calls again "approveNextPayment". Payments made is still 1 since one signer is missing
            When debtor calls "approveNextPayment", Payment is made since all signers has called the function
            As no more payments has to be made, status is REPAID
        */
        await pledgeLoan.connect(owner).approveNextPayment();
        expect(await pledgeLoan.connect(owner).getPaymentsMade()).to.be.equal(1);

        expect(await pledgeLoan.connect(debtor).approveNextPayment()).to.emit(pledgeLoan, 'LoadRepaid');
        expect(await pledgeLoan.connect(owner).getPaymentsMade()).to.be.equal(2);
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(2);

    });

    /**
     * Tests pledged loan is declared as default since it's been passed 40 days and no payment has been made
     */
    it("PledgedLoan declared as default", async function () {
        
        const pledgeLoan = await deployContractAndMakeApprovals();
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(0);
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(0);

        expect(await pledgeLoan.connect(owner).startLoan()).to.emit(pledgeLoan, "LoanStarted");

        increaseTimestamp(40);

        expect(await pledgeLoan.connect(owner).declareDefault()).to.emit(pledgeLoan, "LoanDefaulted");
    });

    /**
     * Tests that only thw owner can declare the loan as default
     */
    it("PledgedLoan only the owner can declare the loan as default", async function () {
        
        const pledgeLoan = await deployContractAndMakeApprovals();
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(0);
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(0);

        expect(await pledgeLoan.connect(owner).startLoan()).to.emit(pledgeLoan, "LoanStarted");

        increaseTimestamp(40);

        expect(pledgeLoan.connect(creditor).declareDefault()).to.be.reverted;
    });

    /**
     * Tests that the loan cannot be declared as default since it is not active yet
     */
    it("PledgedLoan must be active to be declared as default", async function () {
        
        const pledgeLoan = await deployContractAndMakeApprovals();
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(0);
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(0);

        increaseTimestamp(40);

        expect(pledgeLoan.connect(owner).declareDefault()).to.be.revertedWith('Loan is not active');
    });

    /**
     * Tests that the "approveNextPayment" function revert since the loan is ot active yet
     */
    it("PledgedLoan fails since loan is not active yet", async function () {

        const pledgeLoan = await deployContractAndMakeApprovals();
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(0);

        increaseTimestamp(15);
        expect(pledgeLoan.connect(owner).approveNextPayment()).to.be.revertedWith('Loan is not active');
    });

    /**
     * Tests that the "approveNextPayment" revert since the payment time has not arrived yet
     */
    it("PledgedLoan fails since date to pay has not arrived yet", async function () {

        const pledgeLoan = await deployContractAndMakeApprovals();
        expect(await pledgeLoan.connect(owner).getStatus()).to.be.equal(0);

        increaseTimestamp(15);
        expect(pledgeLoan.connect(owner).approveNextPayment()).to.be.revertedWith('The next payment time has not arrived yet');
    });

    /**
     * Tests that the "approveNextPayment" revert since the caller is not a valid signer
     */
    it("PledgedLoan fails since not a valid signer", async function () {

        const pledgeLoan = await deployContractAndMakeApprovals();
        expect(await pledgeLoan.connect(owner).startLoan()).to.emit(pledgeLoan, "LoanStarted");

        increaseTimestamp(31);
        expect(pledgeLoan.connect(other).approveNextPayment()).to.be.revertedWith('The sender is not a valid signer');
    });

    /**
     * Tests that the "approveNextPayment" revert since the signer has already approved the payment
     */
    it("PledgedLoan fails since signer already approve payment", async function () {

        const pledgeLoan = await deployContractAndMakeApprovals();
        expect(await pledgeLoan.connect(owner).startLoan()).to.emit(pledgeLoan, "LoanStarted");

        increaseTimestamp(31);
        await pledgeLoan.connect(owner).approveNextPayment();
        expect(pledgeLoan.connect(owner).approveNextPayment()).to.be.revertedWith('Signer has already approved the payment');
    });

    /**
     * Tests that the "approveNextPayment" revert since the debtor has not approved the contract to spend its ERC20 tokens
     */
    it("PledgedLoan fails since debtor has not approved contract as ERC20 spender", async function () {

        const collateralTokenAddress  = await collateralToken.getAddress();
        const payContractTokenAddress = await payContractToken.getAddress();

        const pledgeLoan = await ethers.deployContract("PledgeLoan", [collateralTokenAddress, 1, payContractTokenAddress, debtor, creditor, 2, 100], {signer: owner}) as PledgeLoan;
        await collateralToken.connect(debtor).approve(await pledgeLoan.getAddress(), 1);
        expect(await pledgeLoan.connect(owner).startLoan()).to.emit(pledgeLoan, "LoanStarted");

        increaseTimestamp(31);
        expect(pledgeLoan.connect(owner).approveNextPayment()).to.be.revertedWith('Debtor must have been approved contract to transfer its ERC 20 tokens');
    });

    /**
     * Tests that the "startLoan" revert since the debtor is not the collateral owner
     */
    it("Starting loan fails since debtor is not the collateral owner", async function () {

        const collateralTokenAddress  = await collateralToken.getAddress();
        const payContractTokenAddress = await payContractToken.getAddress();

        const pledgeLoan = await ethers.deployContract("PledgeLoan", [collateralTokenAddress, 1, payContractTokenAddress, other, creditor, 2, 100], {signer: owner}) as PledgeLoan;
        expect(pledgeLoan.connect(owner).startLoan()).to.be.revertedWith('Debtor must be the collaeral provider before starting the loan');
    });

    /**
     * Tests that the "startLoan" revert since the debtor has not approve the contract to move the collateral ownership
     */
    it("Starting loan fails since debtor has not approved the contract to move the collateral ownership", async function () {

        const collateralTokenAddress  = await collateralToken.getAddress();
        const payContractTokenAddress = await payContractToken.getAddress();

        const pledgeLoan = await ethers.deployContract("PledgeLoan", [collateralTokenAddress, 1, payContractTokenAddress, debtor, creditor, 2, 100], {signer: owner}) as PledgeLoan;
        expect(pledgeLoan.connect(owner).startLoan()).to.be.revertedWith('Contract must have been approved to move collateral from debtor to another address');
    });

    /**  
        Deploys the pledge loan contract. 
        Debtor approves contract to spend their pay tokens
        Debtor approves contract to changes the collateral owner
    */
    async function deployContractAndMakeApprovals(): Promise<PledgeLoan>
    {
        const collateralTokenAddress  = await collateralToken.getAddress();
        const payContractTokenAddress = await payContractToken.getAddress();

        const pledgeLoan = await ethers.deployContract("PledgeLoan", [collateralTokenAddress, 1, payContractTokenAddress, debtor, creditor, 2, 100], {signer: owner}) as PledgeLoan;
        await payContractToken.connect(debtor).approve(await pledgeLoan.getAddress(), 400);
        await collateralToken.connect(debtor).approve(await pledgeLoan.getAddress(), 1);

        return pledgeLoan;
    }

    // Advance block ts in {days}
    async function increaseTimestamp(days: number): Promise<void>
    {
        await ethers.provider.send("evm_increaseTime", [days * 86400]);
        await ethers.provider.send("evm_mine");
    }

});

 