// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

/**
 * @title Validation
 * @dev Contract with abstraction for validation of entities
 */

contract Validation {

    event ValidationEvent(string method, string value, string eventMessage);

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
        emit ValidationEvent("addUser", user, "Insertion of User");
    }

    function addAgent(string memory agent) public {
        agentValidation[agent] = true;
        emit ValidationEvent("addAgent", agent, "Insertion of Agent");
    }

    function addCompany(string memory company) public {
        companyValidation[company] = true;
        emit ValidationEvent("addCompany", company, "Insertion of Company");
    }

    function removeUser(string memory user) public {
        userValidation[user] = false;
        emit ValidationEvent("removeUser", user, "Removal of User");
    }

    function removeAgent(string memory agent) public {
        agentValidation[agent] = false;
        emit ValidationEvent("removeAgent", agent, "Removal of Agent");
    }

    function removeCompany(string memory company) public {
        companyValidation[company] = false;
        emit ValidationEvent("removeCompany", company, "Removal of Company");

    }
}