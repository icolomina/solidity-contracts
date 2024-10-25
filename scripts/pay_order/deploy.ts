import hre from "hardhat";
import Token from "../../ignition/modules/Token";


async function main() {

    /**
     * Deploy Asset and Contract modules using hardhat ignition
     */
    const { token } = await hre.ignition.deploy(Token);

    /**
     * Get token address 
     */
    const tokenAddress = await token.getAddress();
    console.log(`Token deployed to: ${tokenAddress}`);

    /**
     * Get a creditor and debtor signers
     */
    const [creditor, debtor] = await hre.ethers.getSigners();
    const debtorAddress = await debtor.getAddress();
    
    /**
     * Deploy Per Creditor and Per Order contracts
     */
    const payContractByCreditor = await hre.ethers.deployContract('PayContractByCrediter', [], {signer: creditor});
    const payContractByOrder    = await hre.ethers.deployContract('PayContractByOrder', [debtorAddress, tokenAddress], {signer: creditor, value: 200});
    const payContractByCreditorAddress = await payContractByCreditor.getAddress();
    const payContractByOrderAddress = await payContractByOrder.getAddress();

    console.log(`Contract Per Creditor deployed to: ${payContractByCreditorAddress}`);
    console.log(`Contract Per Order deployed to: ${payContractByOrderAddress}`);
}

main().catch(console.error);