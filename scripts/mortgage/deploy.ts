import hre from "hardhat";
import Token from "../../ignition/modules/Token";


async function main() {

    /**
     * Deploy TokenERC 20
     */
    const { token } = await hre.ignition.deploy(Token);

    /**
     * Get token ERC Address 
     */
    const tokenAddress = await token.getAddress();
    console.log(`Token deployed to: ${tokenAddress}`);

    /**
     * Get a propietary and debtor
     */
    const [propietary, debtor] = await hre.ethers.getSigners();
    
    /**
     * Deploy the Mortgage contract
     */
    const propietaryAddress = await propietary.getAddress();
    const debtorAddress = await debtor.getAddress();
    const mortgageContract = await hre.ethers.deployContract('Mortgage', [
        'MyMortgag', 
        'MTG',
        1,
        'https://www.info.com',
        propietaryAddress,
        debtorAddress,
        tokenAddress,
        150,
        300,
        30,
        1
    ])
    const mortgageContractAddress = await mortgageContract.getAddress();
    console.log(`Mortgage contract deployed to: ${mortgageContractAddress}`);
}

main().catch(console.error);