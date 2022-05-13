pragma solidity ^0.8.4;

import "./NewToken.sol";

// Learn more about the ERC20 implementation
// on OpenZeppelin docs: https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable
import "@openzeppelin/contracts/access/Ownable.sol";

contract BuySell is Ownable {

    struct sellingInstance {
        address seller;
        address tokenAddress;
        uint256 amountOfETH;
        uint amountToSell;
    }

    sellingInstance [] sellingInstances;

    // Our Token Contract
    NewToken newToken;

    // token price for ETH
    uint256 public tokensPerEth = 100;

    // Event that log buy operation
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens, uint amountToSell);

    constructor(address tokenAddress) {
        newToken = YourToken(tokenAddress);
    }

    function setPrice(uint256 amountOfETH, address tokenAddress) public returns (sellingInstance instance){
        //look for a selling instance in the array
        for (uint j = 0; j < sellingInstances.length; j++) {
            if (sellingInstances[i].tokenAddress == tokenAddress && sellingInstances[i] == msg.sender) {
                sellingInstances[i].amountOfETH == amountOfETH;
                return sellingInstances[i];
            }
        }
        //if there is not create a new one
        s = sellingInstance(msg.sender, tokenAddress, amountOfETH);
        sellingInstances.push(s);
        return s;

    }
    function injectionSort(sellingInstance[] arr) private returns(sellingInstances[] array) {
        sellingInstances memory array= arr;
        sellingInstance key;
        uint j;
        for (uint i =0; i<array.length; i++){
            key = array[i];
            j = i - 1;

            // Move elements of arr[0..i-1],
            // that are greater than key, to one
            // position ahead of their
            // current position
            while (j >= 0 && array[j].amountOfETH > key.amountOfETH)
            {
                array[j + 1] = array[j];
                j = j - 1;
            }
            array[j + 1] = key;
        }
        return array;
    }

    function nextCheapest(address tokenAddress, sellingInstance previousCheapest) private returns (sellingInstance instance){
        sellingInstance[] memory sortedArray = injectionSort(sellingInstances);

        for (uint j = 0; j < sortedArray.length; j++) {
            if (sortedArray[i].tokenAddress == tokenAddress && sortedArray[i].amountOfETH>previousCheapest.amountOfETH) {
                return sellingInstances[i];
            }
        }
        return null;

    }
    function firstCheapest(address tokenAddress) private returns(sellingInstance instance){
        for (uint j = 0; j < sortedArray.length; j++) {
            if (sortedArray[i].tokenAddress == tokenAddress) {
                return sellingInstances[i];
            }
        }
        return null;
    }

    function getPriceForTokens(address tokenAddress, uint amount) public view returns(uint price){
        sellingInstance firstCheapest = firstCheapest(tokenAddress);
        if(firstCheapest == null){

        }

        uint count = amount;
        uint price =;
        while (count>0){

        }

    }

    /**
    * @notice Allow users to buy token for ETH
  */
    function buyTokens(address tokenAddress) public payable returns (uint256 tokenAmount) {
        sellingInstance firstCheapest = firstCheapest(tokenAddress);
        if(firstCheapest == null){

        }

        require(msg.value > firstCheapest.amountOfETH, "Send ETH to buy some tokens");

        uint256 amountToBuy = msg.value / tokensPerEth;

        // check if the Vendor Contract has enough amount of tokens for the transaction
        uint256 vendorBalance = newToken.balanceOf(address(this));
        require(vendorBalance >= amountToBuy, "Vendor contract has not enough tokens in its balance");

        // Transfer token to the msg.sender
        (bool sent) = newToken.transfer(msg.sender, amountToBuy);
        require(sent, "Failed to transfer token to user");

        // emit the event
        emit BuyTokens(msg.sender, msg.value, amountToBuy);

        return amountToBuy;
    }
    /**
    * @notice Allow the owner of the contract to withdraw ETH
  */

    /**
    * @notice Allow the owner of the contract to withdraw ETH
  */
    function withdraw() public onlyOwner {
        uint256 ownerBalance = address(this).balance;
        require(ownerBalance > 0, "Owner has not balance to withdraw");

        (bool sent,) = msg.sender.call{value : address(this).balance}("");
        require(sent, "Failed to send user balance back to the owner");
    }
}
