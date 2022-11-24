/**
 * @author Musket
 */
// SPDX-License-Identifier: BUSL-1.1 
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";


interface IMockToken{
    function init(string memory name_, string memory symbol_, address owner_) external;
}

contract FactoryMockToken {

    address public mockTokenTemplate;

    address public owner;
    event Issue(address token);

    constructor(){
        owner = msg.sender;
    }

    function issueYourToken(string memory name, string memory symbol) public {

        address creator = msg.sender;

        bytes32 salt = keccak256(
            abi.encodePacked(creator, address(this), block.timestamp)
        );

        address token = Clones.cloneDeterministic(mockTokenTemplate, salt);
        IMockToken(token).init(name, symbol, creator);
        emit Issue(token);
    }

    function setMockTokenTemplate(address _mockTokenTemplate) public   {
        require(msg.sender == owner, "only owner can change name and symbol");
        mockTokenTemplate = _mockTokenTemplate;
    }
}
