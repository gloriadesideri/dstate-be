//SPDX-License-Identifier: PENDING

pragma solidity ^0.8.4;

import "./NewToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Rent is Ownable{

    struct rent {
        uint tokenAmount; //number of tokens that exist (not in 10**18)
        uint rentPrice;
        uint depositPrice;
        uint currentDeposit;
        uint depositProposal; //to keep for damages out of 100, 101 means no proposal
        uint caretakerShare; //out of 100
        uint rentNumber;
        uint remainingMonths; //0 if not for rent or contract is over
        uint rentBlockTime;
        uint8 status; //0-Unlisted, 1-NotRented, 2-PaymentDue, 3-PaymentOk
        mapping(uint => uint) rentBlock;
        mapping(uint => uint) rentAmountPerToken;
        address payable caretaker; //0x0 for no caretaker
        address payable tenant; //0x0 for no tenant
        address payable previousTenant; //0x0 for no previous tenant
    }
    rent rentInfo;
    address payable nullAddress = payable(0x0000000000000000000000000000000000000000);
    address payable disputeAddress = payable(0x7176bd09199068E21bE4137d1630fb8712633445);
    address tokenAddress;
    mapping( uint => mapping(address => bool)) tokenHolders; //true means rent has been claimed
    

    event RentPaid(address tenant, uint amountOfETH, uint blockNumber);

    
    constructor(uint _rentPrice, uint _depositPrice, uint _remainingMonths, uint _caretakerShare, address payable _caretaker, address payable _tenant, address _votingContract, address _tokenAddress) {
        ERC20 token = ERC20(_tokenAddress);
        rentInfo.tokenAmount = token.totalSupply() / (10**18);
        rentInfo.rentPrice = _rentPrice;
        rentInfo.depositPrice = _depositPrice;
        rentInfo.currentDeposit = 0;
        rentInfo.caretakerShare = _caretakerShare;
        rentInfo.caretaker = _caretaker;
        rentInfo.rentBlock[0] = block.number;
        rentInfo.rentNumber = 0;
        rentInfo.rentAmountPerToken[0] = 0;
        rentInfo.tenant = _tenant;
        rentInfo.previousTenant = nullAddress;
        rentInfo.remainingMonths = _remainingMonths;
        rentInfo.depositProposal = 101;
        rentInfo.rentBlockTime = block.timestamp;
        tokenAddress = _tokenAddress;
        if(rentInfo.tenant != nullAddress) { rentInfo.status = 2; }
        else { rentInfo.status = 0; }
        transferOwnership(_votingContract);
    }

    function getRentPrice() public view returns(uint _rentPrice){
        return rentInfo.rentPrice;
    }

    function getDepositPrice() public view returns(uint depositPrice){
        return rentInfo.depositPrice;
    }

    function getCurrentDeposit() public view returns(uint _currentDeposit){
        return rentInfo.currentDeposit;
    }

    function getDepositProposal() public view returns(uint _depositProposal){
        return rentInfo.depositProposal;
    }

    function getCaretakerShare() public view returns(uint _caretakerShare){
        return rentInfo.caretakerShare;
    }

    function getRentNumber() public view returns(uint _rentNumber){
        return rentInfo.rentNumber;
    }

    function getRemainingMonths() public view returns(uint _remainingMonths){
        return rentInfo.remainingMonths;
    }

    function getRentBlockTime() public view returns(uint _rentBlockTime){
        return rentInfo.rentBlockTime;
    }

    function getStatus() public view returns(uint8 _caretakerStatus){
        return rentInfo.status;
    }

    function getRentBlock() public view returns(uint _rentBlock){
        return rentInfo.rentBlock[rentInfo.rentNumber];
    }

    function getRentAmountPerToken() public view returns(uint _rentAmountPerToken){
        return rentInfo.rentAmountPerToken[rentInfo.rentNumber];
    }

    function getPreviousRentBlock(uint _rentNumber) public view returns(uint _rentBlock){
        return rentInfo.rentBlock[_rentNumber];
    }

    function getPreviousRentAmountPerToken(uint _rentNumber) public view returns(uint _rentAmountPerToken){
        return rentInfo.rentAmountPerToken[_rentNumber];
    }

    function getCaretaker() public view returns(address _caretaker){
        return rentInfo.caretaker;
    }

    function getTenant() public view returns(address _tenant){
        return rentInfo.tenant;
    }

    function getPreviousTenant() public view returns(address _previousTenant){
        return rentInfo.previousTenant;
    }

    function getRentClaimed(address _claimer) public view returns(bool _rentClaimed){
        return tokenHolders[rentInfo.rentNumber][_claimer];
    }

    function getPreviousRentClaimed(address _claimer, uint _rentNumber) public view returns(bool _rentClaimed){
        return tokenHolders[_rentNumber][_claimer];
    }

    
    function changeRentPrice(uint _rentPrice) public onlyOwner returns(uint _newRentPrice){
        rentInfo.rentPrice = _rentPrice;
        return rentInfo.rentPrice;
    }

    function changeDepositPrice(uint _depositPrice) public onlyOwner returns(uint _newDepositPrice){
        rentInfo.depositPrice = _depositPrice;
        return rentInfo.depositPrice;
    }

    function changeCaretakerShare(uint _caretakerShare) public onlyOwner returns(uint _newCaretakerShare){
        rentInfo.caretakerShare = _caretakerShare;
        return rentInfo.caretakerShare;
    }

    function changeCaretaker(address payable _caretaker) public onlyOwner returns(address _newCaretaker){
        rentInfo.caretaker = _caretaker;
        return rentInfo.caretaker;
    }

    function removeTenant() public onlyOwner returns(address _newTenant) {
        rentInfo.previousTenant = rentInfo.tenant;
        rentInfo.tenant = nullAddress;
        rentInfo.remainingMonths = 0;
        rentInfo.status = 1;
        return rentInfo.tenant;
    }

    function newTenant(address payable _tenant, uint _remainingMonths, uint _rentPrice, uint _depositPrice) public onlyOwner returns(address _newTenant, uint _newMonths) {
        require(rentInfo.status < 2, "Current tenant must be removed first");
        rentInfo.tenant = _tenant;
        rentInfo.remainingMonths = _remainingMonths;
        rentInfo.rentPrice = _rentPrice;
        rentInfo.depositPrice = _depositPrice;
        rentInfo.status = 2;
        return (rentInfo.tenant, rentInfo.remainingMonths);
    }

    function renewContract(uint _additionalMonths) public onlyOwner returns(uint _newMonths) {
        rentInfo.remainingMonths += _additionalMonths;
        return rentInfo.remainingMonths;
    }

    function changeDisputeAddress() public returns(address _newDisputeAddress) {
        require(msg.sender == disputeAddress, "Function must be called from current disputeAddress");
        disputeAddress = payable(msg.sender);
        return disputeAddress;
    }

    function requestRent() public {
        require(block.timestamp - rentInfo.rentBlockTime > 2629743, "One month has not gone by yet");

        rentInfo.rentBlockTime = block.timestamp;
        rentInfo.rentNumber += 1;
        rentInfo.status = 2; 
    }

    function payRent() public payable {
        require(rentInfo.status == 2, "Rent is not due yet");
        require(rentInfo.remainingMonths > 0, "Rental contract is over");
        if(rentInfo.currentDeposit != 0){
            require(msg.value >= rentInfo.rentPrice, "Not enough eth to cover rent");
            rentInfo.rentBlock[rentInfo.rentNumber] = block.number;
            rentInfo.caretaker.transfer((rentInfo.caretakerShare * msg.value) / 100);
            rentInfo.rentAmountPerToken[rentInfo.rentNumber] = (msg.value - ((rentInfo.caretakerShare * msg.value) / 100)) / rentInfo.tokenAmount;
            rentInfo.remainingMonths -= 1; 
            rentInfo.status = 3;
            if(rentInfo.remainingMonths == 0) {
                rentInfo.previousTenant = rentInfo.tenant;
                rentInfo.tenant = nullAddress;
                rentInfo.status = 1;
            }
        }
        else {
            require(msg.value >= rentInfo.rentPrice + rentInfo.depositPrice, "Not enough eth to cover rent & deposit");
            rentInfo.rentBlock[rentInfo.rentNumber] = block.number;
            rentInfo.caretaker.transfer((rentInfo.caretakerShare * rentInfo.rentPrice) / 100);
            rentInfo.rentAmountPerToken[rentInfo.rentNumber] = (rentInfo.rentPrice - ((rentInfo.caretakerShare * rentInfo.rentPrice) / 100)) / rentInfo.tokenAmount;
            rentInfo.currentDeposit = msg.value - rentInfo.rentPrice;
            rentInfo.remainingMonths -= 1; 
            rentInfo.status = 3;
        }

        emit RentPaid(msg.sender, msg.value, block.number);
    }

    
    function withdrawRent() public returns(uint _rent) {

        require(!tokenHolders[rentInfo.rentNumber][msg.sender], "Rent already claimed"); 
        require(rentInfo.rentAmountPerToken[rentInfo.rentNumber] > 0, "Rent not available yet");
        ERC20Votes token = ERC20Votes(tokenAddress);
        uint votes = token.getPastVotes(msg.sender, rentInfo.rentBlock[rentInfo.rentNumber]);
        require(votes != 0, "No delegated votes");
        uint rentPayment = (rentInfo.rentAmountPerToken[rentInfo.rentNumber] * votes) / (10 ** 18);
        payable(msg.sender).transfer(rentPayment); 
        tokenHolders[rentInfo.rentNumber][msg.sender] = true;
        return rentPayment;
    }

    function withdrawPreviousRent(uint _rentNumber) public returns(uint _rent) {

        require(!tokenHolders[_rentNumber][msg.sender], "Rent already claimed"); 
        require(rentInfo.rentAmountPerToken[_rentNumber] > 0, "Rent not available yet");
        ERC20Votes token = ERC20Votes(tokenAddress);
        uint votes = token.getPastVotes(msg.sender, rentInfo.rentBlock[_rentNumber]);
        require(votes != 0, "No delegated votes");
        uint rentPayment = (rentInfo.rentAmountPerToken[_rentNumber] * votes) / (10 ** 18);
        payable(msg.sender).transfer(rentPayment); 
        tokenHolders[_rentNumber][msg.sender] = true;
        return rentPayment;
    }

    function returnDepositProposal(uint _depositProposal) public {
        //function to suggest how much of the deposit should be returned, only called by caretaker, it should be less than the current deposit
        require(_depositProposal < 101, "Please enter a valid % of the deposit");
        require(msg.sender == rentInfo.caretaker, "Only the caretaker can call this function");
        require(rentInfo.status == 1, "Rental contract is not over");
        require(rentInfo.currentDeposit > 0, "Deposit has already been withdrawn");

        rentInfo.depositProposal = _depositProposal; //something

    }
    
    function returnDepositAcceptance(bool _depositAcceptance) public {
        //function to accept or decline the depositProposal. If accepted it is split in the agreed manner, if not it all gets sent to the disputeAddress
        require(msg.sender == rentInfo.previousTenant, "Only the previous tenant can call this function");
        require(rentInfo.depositProposal != 101, "No deposit proposal has been created yet");
        uint deposit = rentInfo.currentDeposit;
        rentInfo.currentDeposit = 0;
        if(_depositAcceptance) {
            rentInfo.caretaker.transfer((deposit * rentInfo.depositProposal) / 100 ); //should work sending 0 transfer
            rentInfo.previousTenant.transfer(deposit - ((deposit * rentInfo.depositProposal) / 100 ));
        }
        else{
            disputeAddress.transfer(deposit);
        }
        rentInfo.previousTenant = nullAddress;
        rentInfo.depositProposal = 101;
    }
}