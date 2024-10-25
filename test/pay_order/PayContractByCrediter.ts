import { expect } from "chai";
import { ethers } from "hardhat";
import { PayContractByCrediter, TokenERC20 } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Pay Contract By Crediter", function () {

    let payContractToken: TokenERC20;
    let payContractByCrediter: PayContractByCrediter;
  
    let owner: SignerWithAddress;
    let creditor: SignerWithAddress;
    let debtor: SignerWithAddress;
    let other: SignerWithAddress;
  
    beforeEach(async function() {
        [owner, creditor, debtor, other] = await ethers.getSigners();
    
        payContractToken = await ethers.deployContract("TokenERC20", ['DollarTest', 'DTS'], owner) as TokenERC20;
        payContractByCrediter = await ethers.deployContract("PayContractByCrediter", [], {signer: creditor}) as PayContractByCrediter;
        await payContractToken.connect(owner).mint(debtor, 250);
        await payContractToken.connect(debtor).approve(await payContractByCrediter.getAddress(), 200);
    });

    it("Pay to the creditor and mark as received", async function () {

        const orderId = '1998hhufgy6';
        const debtorAddress = await debtor.getAddress();
        const amount = 200;
        const tokenErcAddress = await payContractToken.getAddress();

        expect(payContractByCrediter.connect(creditor).received(orderId)).to.be.revertedWith('Order must be PAID');
        expect(await payContractByCrediter.connect(creditor).createPaymentOrder(debtorAddress, orderId, amount, tokenErcAddress)).to.emit(payContractByCrediter, "PaymentOrderCreated");
        expect(await payContractByCrediter.connect(creditor).getOrderState(orderId)).to.be.equal(0);
        
        expect(payContractByCrediter.connect(other).pay(orderId)).to.be.revertedWith('Only the debtor can send thge payment');
        expect(await payContractByCrediter.connect(debtor).pay(orderId)).to.emit(payContractByCrediter, "PaymentOrderReceived");
        expect(await payContractByCrediter.connect(creditor).getOrderState(orderId)).to.be.equal(1);

        expect(payContractByCrediter.connect(debtor).received(orderId)).to.be.revertedWith('Only the creditor can confirm reception');
        expect(await payContractByCrediter.connect(creditor).received(orderId)).to.emit(payContractByCrediter, "FundsOrderReceived");
        expect(await payContractByCrediter.connect(creditor).getOrderState(orderId)).to.be.equal(2);

        const creditorBalance = await payContractToken.connect(owner).balanceOf(await creditor.getAddress());
        const debtorBalance = await payContractToken.connect(owner).balanceOf(await debtor.getAddress());
        expect(creditorBalance).to.be.equal(200);
        expect(debtorBalance).to.be.equal(50);
    });

});