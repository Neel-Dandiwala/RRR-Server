// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/**
 * @title Validation
 * @dev Contract with abstraction for validation of entities
 */

contract Validation {

    mapping(string => bool) private userValidation;
    mapping(string => bool) private agentValidation;
    mapping(string => bool) private companyValidation;

    constructor() {}

    function validateUser(string memory user) public view returns (bool) { 
        require(userValidation[user] == true);
        return true;
    }

    function validateAgent(string memory agent) public view returns (bool) { 
        require(agentValidation[agent] == true);
        return true;
    }

    function validateCompany(string memory company) public view returns (bool) { 
        require(companyValidation[company] == true);
        return true;
    }

    function addUser(string memory user) public {
        userValidation[user] = true;
    }

    function addAgent(string memory agent) public {
        agentValidation[agent] = true;
    }

    function addCompany(string memory company) public {
        companyValidation[company] = true;
    }

    function removeUser(string memory user) public {
        userValidation[user] = false;
    }

    function removeAgent(string memory agent) public {
        agentValidation[agent] = false;
    }

    function removeCompany(string memory company) public {
        companyValidation[company] = false;
    }
}