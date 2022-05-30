//SPDX-License-Identifier: Unlicensed for now
pragma solidity ^0.8.4;

import "./NewToken.sol";

// Learn more about the ERC20 implementation
// on OpenZeppelin docs: https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable
import "@openzeppelin/contracts/access/Ownable.sol";
contract BuySell is Ownable {

    struct sellingInstance {
        address payable seller;
        address tokenAddress;
        uint256 amountOfETH;
        uint256 id;
        uint amountToSell;

    }

    struct variables{
        int firstCheapestIndex;
        int nextCheapestIndex;
        bool sent;
        uint price;
        int remainingToBuy;

    }

    sellingInstance [] sellingInstances;
    uint256 idCount=0;



    // Event that log buy operation
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);


    function setPrice(uint256 amountOfETH, uint256 tokenAmount, address tokenAddress) public returns (sellingInstance memory instance){
        ERC20 newToken = ERC20(tokenAddress);
        newToken.transferFrom(msg.sender,address (this),tokenAmount);
        sellingInstance memory s = sellingInstance(payable(msg.sender), tokenAddress, amountOfETH, idCount,tokenAmount);
        sellingInstances.push(s);
        idCount= idCount+1;
        return s;

    }
    function injectionSort(sellingInstance[] memory arr) private pure returns(sellingInstance[] memory array) {
        //sellingInstance[] memory array= arr;
        sellingInstance memory key;
        int j;
        for (int i =0; i<int(arr.length); i++){
            key = arr[uint(i)];
            j = i - 1;

            // Move elements of arr[0..i-1],
            // that are greater than key, to one
            // position ahead of their
            // current position
            while (j >= 0 && arr[uint(j)].amountOfETH > key.amountOfETH)
            {
                arr[uint(j + 1)] = arr[uint(j)];
                j = j - 1;
            }
            arr[uint(j + 1)] = key;
        }
        return arr;
    }

    function getNextCheapest(address tokenAddress, sellingInstance memory previousCheapest, sellingInstance[] memory sortedArray) private pure returns (int instanceIndex){
        //fix for when there is cheapest array with 0 for sale

        for (uint j = 0; j < sortedArray.length; j++) {
            if (sortedArray[j].tokenAddress == tokenAddress && sortedArray[j].amountOfETH> previousCheapest.amountOfETH) {
                return int(j); //changed from returning j
            }
        }
        return -1;

    }
    function getFirstCheapest(address tokenAddress, sellingInstance[] memory sortedArray) private pure returns(int instanceIndex){
        //fix for when there is cheapest array with 0 for sale
        for (uint j = 0; j < sortedArray.length; j++) {
            if (sortedArray[j].tokenAddress == tokenAddress) {
                return int(j); //changed from returning j
            }
        }
        return -1;
    }

    function getNextCheapestForSeller(address tokenAddress, sellingInstance memory previousCheapest, sellingInstance[] memory sortedArray, address sellerAddress) private pure returns (int instanceIndex){
        //fix for when there is cheapest array with 0 for sale

        for (uint j = 0; j < sortedArray.length; j++) {
            if (sortedArray[j].tokenAddress == tokenAddress && sortedArray[j].amountOfETH> previousCheapest.amountOfETH && sortedArray[j].seller == sellerAddress) {
                return int(j); //changed from returning j
            }
        }
        return -1;

    }
    function getFirstCheapestForSeller(address tokenAddress, sellingInstance[] memory sortedArray, address sellerAddress) private pure returns(int instanceIndex){
        //fix for when there is cheapest array with 0 for sale
        for (uint j = 0; j < sortedArray.length; j++) {
            if (sortedArray[j].tokenAddress == tokenAddress && sortedArray[j].seller == sellerAddress) {
                return int(j); //changed from returning j
            }
        }
        return -1;
    }

    function getPriceForTokens(address tokenAddress, uint amount) public view returns(uint pri){
        sellingInstance[] memory sortedArray = injectionSort(sellingInstances);
        int firstCheapestIndex = getFirstCheapest(tokenAddress, sortedArray);

        int nextCheapestIndex;
        sellingInstance memory nextCheapest;


        uint remainingToBuy =amount;
        uint price;

        if(firstCheapestIndex == -1){
            return 0;
        }
        sellingInstance memory firstCheapest= sortedArray[uint256(firstCheapestIndex)];

        if(firstCheapest.amountToSell>=amount){
            price= (amount * firstCheapest.amountOfETH) / (10 ** 18);
            return price;
        }else{
            price= (firstCheapest.amountToSell * firstCheapest.amountOfETH) / (10 ** 18);
            remainingToBuy= remainingToBuy - firstCheapest.amountToSell;
            nextCheapestIndex = getNextCheapest(tokenAddress,firstCheapest, sortedArray);
            //emit event not enough tokens or return struct instead
        }

        while(remainingToBuy >0 && nextCheapestIndex!=-1){
            nextCheapest=sortedArray[uint256(nextCheapestIndex)];
            if(nextCheapest.amountToSell>=remainingToBuy){
                price= price + ((remainingToBuy * nextCheapest.amountOfETH) / (10 ** 18));
                return price;
            }else{
                price= price + ((nextCheapest.amountToSell * nextCheapest.amountOfETH) / (10 ** 18));
                remainingToBuy= remainingToBuy - firstCheapest.amountToSell;
                nextCheapestIndex = getNextCheapest(tokenAddress,nextCheapest, sortedArray);
            }
        }
        return price;
    }

    function find(uint id) private view returns(int realIndex){
        for (int i =0; i<int(sellingInstances.length); i++){
            if(sellingInstances[uint(i)].id==id){
                return i;
            }
        }
        return -1;
    }

    /**
    * @notice Allow users to buy token for ETH
  */

    function buyTokens(address tokenAddress, uint promisedPrice, uint amount) public payable {
        uint actualPrice = getPriceForTokens(tokenAddress,amount);


        //return actualPrice;
        require(msg.value >= actualPrice, "Send ETH to buy some tokens");

        ERC20 newToken = ERC20(tokenAddress);


        // check if the Vendor Contract has enough amount of tokens for the transaction
        uint256 vendorBalance = newToken.balanceOf(address(this));
        require(vendorBalance >= amount, "Vendor contract has not enough tokens in its balance");
        require(actualPrice == promisedPrice, "Price mismatch");

        // Transfer token to the msg.sender


        sellingInstance [] memory sortedArray = injectionSort(sellingInstances);

        //int firstCheapestIndex = int(getFirstCheapest(tokenAddress, sortedArray));

        //int nextCheapestIndex;
        sellingInstance memory nextCheapest;

        //uint remainingToBuy =amount;
        //uint price=0;

        variables memory vars = variables(int(getFirstCheapest(tokenAddress, sortedArray)), -1, false, 0, int(amount));
        (vars.sent) = newToken.transfer(msg.sender, amount);
        require(vars.firstCheapestIndex != -1, "No tokens available");

        sellingInstance memory firstCheapest= sortedArray[uint(vars.firstCheapestIndex)];
        int firstCheapestRealIndex = int(firstCheapest.id);

        if(firstCheapest.amountToSell>=amount){
            sellingInstances[uint(firstCheapestRealIndex)].amountToSell = sellingInstances[uint(firstCheapestRealIndex)].amountToSell -amount;
            sellingInstances[uint(firstCheapestRealIndex)].seller.transfer((amount * firstCheapest.amountOfETH) / (10 ** 18));
            vars.remainingToBuy = 0;
        }else{
            vars.price= (firstCheapest.amountToSell * firstCheapest.amountOfETH) / (10 ** 18);
            sellingInstances[uint(firstCheapestRealIndex)].seller.transfer(vars.price);

            vars.remainingToBuy = vars.remainingToBuy- int(sellingInstances[uint(firstCheapestRealIndex)].amountToSell);
            sellingInstances[uint(firstCheapestRealIndex)].amountToSell=0;
            vars.nextCheapestIndex = getNextCheapest(tokenAddress,firstCheapest, sortedArray);

        }
        while(vars.remainingToBuy >0 && vars.nextCheapestIndex!=-1){
            nextCheapest=sellingInstances[uint(vars.nextCheapestIndex)];
            int nextCheapestRealIndex = int(nextCheapest.id);
            if(int(nextCheapest.amountToSell)>=vars.remainingToBuy){

                sellingInstances[uint(nextCheapestRealIndex)].amountToSell = sellingInstances[uint(nextCheapestRealIndex)].amountToSell -uint(vars.remainingToBuy);
                sellingInstances[uint(nextCheapestRealIndex)].seller.transfer((uint(vars.remainingToBuy) * nextCheapest.amountOfETH) / (10 ** 18));
                vars.remainingToBuy = 0;


            }else{
                vars.price= (nextCheapest.amountToSell * nextCheapest.amountOfETH) / (10 ** 18);
                sellingInstances[uint(nextCheapestRealIndex)].seller.transfer(vars.price);
                vars.remainingToBuy = vars.remainingToBuy- int(sellingInstances[uint(nextCheapestRealIndex)].amountToSell);

                sellingInstances[uint(nextCheapestRealIndex)].amountToSell=0;
                vars.nextCheapestIndex = getNextCheapest(tokenAddress, nextCheapest, sortedArray);
            }
        }

        require(vars.sent, "Failed to transfer token to user");

        // emit the event
        emit BuyTokens(msg.sender, msg.value, amount);


    }


    /**
    * @notice Allow seller to cancel sale of tokens
  */
    function cancelSale(address tokenAddress, uint amount) public {
        ERC20 newToken = ERC20(tokenAddress);


        // check if the Vendor Contract has enough amount of tokens for the transaction
        uint256 vendorBalance = newToken.balanceOf(address(this));
        require(vendorBalance >= amount, "Vendor contract has not enough tokens in its balance");


        // Transfer token to the msg.sender


        sellingInstance [] memory sortedArray = injectionSort(sellingInstances);


        sellingInstance memory nextCheapest;



        variables memory vars = variables(int(getFirstCheapestForSeller(tokenAddress, sortedArray, msg.sender)), -1, false, 0, int(amount));
        //(vars.sent) = newToken.transfer(msg.sender, amount);
        require(vars.firstCheapestIndex != -1, "No tokens available");
        uint amountToCancel = 0;

        sellingInstance memory firstCheapest= sortedArray[uint(vars.firstCheapestIndex)];
        int firstCheapestRealIndex = int(firstCheapest.id);

        if(firstCheapest.amountToSell>=amount){
            sellingInstances[uint(firstCheapestRealIndex)].amountToSell = sellingInstances[uint(firstCheapestRealIndex)].amountToSell -amount;
            amountToCancel = amountToCancel + amount;
            vars.remainingToBuy = 0;
        }else{
            //vars.price= (amount * firstCheapest.amountOfETH) / (10 ** 18);
            //sellingInstances[uint(firstCheapestRealIndex)].seller.transfer(vars.price);
            vars.remainingToBuy = vars.remainingToBuy- int(sellingInstances[uint(firstCheapestRealIndex)].amountToSell);
            amountToCancel = amountToCancel + sellingInstances[uint(firstCheapestRealIndex)].amountToSell;
            sellingInstances[uint(firstCheapestRealIndex)].amountToSell=0;
            vars.nextCheapestIndex = getNextCheapestForSeller(tokenAddress,firstCheapest, sortedArray, msg.sender);
        }
        while(vars.remainingToBuy > 0 && vars.nextCheapestIndex!=-1){
            nextCheapest=sellingInstances[uint(vars.nextCheapestIndex)];
            int nextCheapestRealIndex = int(nextCheapest.id);
            if(nextCheapest.amountToSell>=uint(vars.remainingToBuy)){
                sellingInstances[uint(nextCheapestRealIndex)].amountToSell = sellingInstances[uint(nextCheapestRealIndex)].amountToSell -uint(vars.remainingToBuy);
                //sellingInstances[uint(nextCheapestRealIndex)].seller.transfer((amount * nextCheapest.amountOfETH) / (10 ** 18));
                amountToCancel = amountToCancel + uint(vars.remainingToBuy);
                vars.remainingToBuy = 0;
            }else{
                //vars.price= (amount * firstCheapest.amountOfETH) / (10 ** 18);
                //sellingInstances[uint(nextCheapestRealIndex)].seller.transfer(vars.price);
                amountToCancel = amountToCancel + sellingInstances[uint(nextCheapestRealIndex)].amountToSell;
                vars.remainingToBuy = vars.remainingToBuy - int(sellingInstances[uint(nextCheapestRealIndex)].amountToSell);
                sellingInstances[uint(nextCheapestRealIndex)].amountToSell=0;
                vars.nextCheapestIndex = getNextCheapestForSeller(tokenAddress,firstCheapest, sortedArray, msg.sender);
            }
        }
        (vars.sent) = newToken.transfer(msg.sender, amountToCancel);
        require(vars.sent, "Failed to return token to seller");
        //maybe emit an event
    }


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
