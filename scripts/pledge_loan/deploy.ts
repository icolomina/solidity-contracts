import hre from "hardhat";
import Token from "../../ignition/modules/Token";
import Asset from "../../ignition/modules/Asset";


async function main() {

    /**
     * Deploy Asset and Contract modules using hardhat ignition
     */
    const { asset } = await hre.ignition.deploy(Asset);
    const { token } = await hre.ignition.deploy(Token);

    /**
     * Get token and collateral addresses 
     */
    const collateralAddress = await asset.getAddress();
    const tokenAddress = await token.getAddress();

    console.log(`Collateral deployed to: ${collateralAddress}`);
    console.log(`Token deployed to: ${tokenAddress}`);

    /**
     * Get debtor, creditor and owner signers
     * Get the asset contract
     * Assign a tokenID to the addr address using the asset assignToken function
     */
    const [debtor, creditor, owner] = await hre.ethers.getSigners();
    const assetContract = await hre.ethers.getContractAt('HouseAsset', collateralAddress);
    await assetContract.assignToken(1, 'https://www.hasset.com', await debtor.getAddress());
    
    /**
     * Deploy the Pledge Loan contract using the collateral address, the collateral ID, the token address, the debtor address, the creditor address, the total payments and the  
     * payment amount
     */
    const contract = await hre.ethers.deployContract("PledgeLoan", [collateralAddress, 1, tokenAddress, debtor, creditor, 2, 100], {signer: owner});
    const pledgeLoanAddress = await contract.getAddress();
    console.log(`PledgeLoan deployed to: ${pledgeLoanAddress}`);
}

main().catch(console.error);