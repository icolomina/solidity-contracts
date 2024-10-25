import { expect } from "chai";
import { ethers } from "hardhat";
import { PayContractByOrder, TokenERC20 } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


describe("Pay Contract By Order", function () {

  let payContractToken: TokenERC20;
  let payContractByOrder: PayContractByOrder;

  let owner: SignerWithAddress;
  let creditor: SignerWithAddress;
  let debtor: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async function() {
    [owner, creditor, debtor, other] = await ethers.getSigners();

    const debtorAddress = await debtor.getAddress();
    payContractToken = await ethers.deployContract("TokenERC20", ['DollarTest', 'DTS'], owner) as TokenERC20;

    const payContractTokenAddress = await payContractToken.getAddress();
    payContractByOrder = await ethers.deployContract("PayContractByOrder", [debtorAddress, payContractTokenAddress], {value: 200, signer: creditor});
    await payContractToken.connect(owner).mint(debtor, 250);
    await payContractToken.connect(debtor).approve(await payContractByOrder.getAddress(), 200);
  });

  it("Pay to the creditor and mark as received", async function () {
    expect(payContractByOrder.connect(creditor).received()).to.be.revertedWith('Order must be PAID');
    expect(await payContractByOrder.connect(debtor).pay()).to.emit(payContractByOrder, "PaymentReceived");
    expect(payContractByOrder.connect(other).pay()).to.be.revertedWith('Only the debtor can pay');
    expect(await payContractByOrder.connect(debtor).getState()).to.be.equal(1);
    expect(payContractByOrder.connect(debtor).received()).to.be.revertedWith('Only the creditor can confirm reception');

    expect(await payContractByOrder.connect(creditor).received()).to.emit(payContractByOrder, "FundsReceived");
    expect(await payContractByOrder.connect(creditor).getState()).to.be.equal(2);

    const creditorBalance = await payContractToken.connect(owner).balanceOf(await creditor.getAddress());
    const debtorBalance = await payContractToken.connect(owner).balanceOf(await debtor.getAddress());
    expect(creditorBalance).to.be.equal(200);
    expect(debtorBalance).to.be.equal(50);
  });

});