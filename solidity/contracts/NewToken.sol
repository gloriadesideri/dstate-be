//SPDX-License-Identifier: PENDING

pragma solidity ^0.8.0;

import "./Rent.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract NewToken is ERC20, ERC20Votes {

    Rent public rent;

    struct proposal {
        string title;
        string description;
        uint proposalType; //0-generic, 1-changeRentPrice, 2-changeDepositPrice, 3-changeCaretakerShare, 4-changeCaretaker, 5-removeTenant, 6-newTenant, 7-renewContract
        uint id; //id for proposal in database
        uint blockNumber;
        uint uint0;
        uint uint1;
        uint uint2;
        address address0;
    }
    uint public proposalNumber = 0;
    mapping(uint => proposal) public proposals;
    mapping(uint => uint) public votes;
    mapping(uint => bool) public votingResult;
    mapping(uint => mapping(address => bool)) voters; //true means voted for that id proposal already

    constructor(uint tokenNumber, string memory name, string memory symbol, uint _rentPrice, uint _depositPrice, uint _remainingMonths, uint _caretakerShare, address payable _caretaker, address payable _tenant) ERC20(string(abi.encodePacked("dstate-", name)), symbol) ERC20Permit("Governance") {
        _mint(msg.sender,tokenNumber*10**18);
        delegate(msg.sender);

        rent = new Rent(_rentPrice, _depositPrice, _remainingMonths, _caretakerShare, _caretaker, _tenant, address(this), address(this));

    }
    
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override (ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
        delegate(to);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);

    }
    

    function createProposal(string memory _title, string memory _description, uint _proposalType, uint _uint0, uint  _uint1, uint _uint2, address _address0) public returns(uint _theId){
        proposal memory prop = proposal(_title, _description, _proposalType, proposalNumber, block.number, _uint0,  _uint1, _uint2, _address0);
        proposals[proposalNumber] = prop;
        votes[proposalNumber] = 0;
        proposalNumber++;
        return proposalNumber - 1;
    }

    function vote(uint _proposalId) public returns(bool _result) {
        require(!votingResult[_proposalId], "Voting Ended");
        require(!voters[_proposalId][msg.sender], "Already Voted");
        proposal memory prop = proposals[_proposalId];
        ERC20Votes token = ERC20Votes(address(this));
        votes[_proposalId] += token.getPastVotes(msg.sender, prop.blockNumber);
        voters[_proposalId][msg.sender] = true;

        if(votes[_proposalId] >= (this.totalSupply() / 2)){
            votingResult[_proposalId] = true;

            if(prop.proposalType == 0){
                //generic
                return true;
            }
            else if(prop.proposalType == 1) {
                _changeRentPrice(prop);
                return true;
            }
            else if(prop.proposalType == 2) {
                _changeDepositPrice(prop);
                return true;
            }
            else if(prop.proposalType == 3) {
                _changeCaretakerShare(prop);
                return true;
            }
            else if(prop.proposalType == 4) {
                _changeCaretaker(prop);
                return true;
            }
            else if(prop.proposalType == 5) {
                _removeTenant();
                return true;
            }
            else if(prop.proposalType == 6) {
                _newTenant(prop);
                return true;
            }
            else if(prop.proposalType == 7) {
                _renewContract(prop);
                return true;
            }
            else{
                votingResult[_proposalId] = false;
                return false;
            }
        }
        else { 
            return false;
        }
    }

    function _changeRentPrice(proposal memory _prop) internal {
        rent.changeRentPrice(_prop.uint0);
    }
    
    function _changeDepositPrice(proposal memory _prop) internal {
        rent.changeDepositPrice(_prop.uint0);
    }

    function _changeCaretakerShare(proposal memory _prop) internal {
        rent.changeCaretakerShare(_prop.uint0);
    }

    function _changeCaretaker(proposal memory _prop) internal {
        rent.changeCaretaker(payable(_prop.address0));
    }

    function _removeTenant() internal {
        rent.removeTenant();
    }

    function _newTenant(proposal memory _prop) internal {
        rent.newTenant(payable(_prop.address0), _prop.uint0, _prop.uint1, _prop.uint2);
    }

    function _renewContract(proposal memory _prop) internal {
        rent.renewContract(_prop.uint0);
    }

}