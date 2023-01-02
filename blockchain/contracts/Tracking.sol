// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
import "./ValidationInterface.sol";

/**
 * @title Tracking
 * @dev Contract with abstraction for tracking
 */

contract Tracking {
    address private constant VALIDATION_CONTRACT = 0x5df848c79F19e9a8Ff59F83eD1A862da26aEbA3E;
    ValidationInterface private Validation = ValidationInterface(VALIDATION_CONTRACT);
    address private owner;

    /**
     * @dev Define the structure for a waste submission
     */
    struct Waste {
        string id;
        string description;
        string weight;
        string user;
        string agent;
        string company;
        uint256 submitDate;
        bool exist;
    }

    /**
     * @dev Mapping that define the storage of waste
     */
    mapping(string => Waste) private wasteStorage;

    mapping(string => mapping(string => uint256)) private userStorage;
    mapping(string => mapping(string => uint256)) private agentStorage;
    mapping(string => mapping(string => uint256)) private companyStorage;

    event CreateWaste(
        string id,
        string entity,
        uint256 CreationDate,
        string AcceptMessage
    );
    event TransferWaste(
        string entity,
        string id,
        string AcceptMessage
    );
    
    event TransferReject(
        string entity,
        string id,
        string RejectMessage
    );
    event CreationReject(
        string id,
        string RejectMessage
    );

    event WasteData(
        string description,
        string weight,
        string user,
        string agent,
        string company,
        uint256 submitDate,
        bool exist
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
     * @dev Function that sets the new owner:
     */
    function setOwner(address newOwner) onlyOwner external {
        owner = newOwner;
    }

    /**
     * @dev Function that create the Waste Entry:
     */
    function creationWaste(
        string memory id,
        string memory description,
        string memory weight,
        string memory user
    ) public onlyOwner {
        if (wasteStorage[id].exist) {
            emit CreationReject(
                id,
                "Waste for this id already exist"
            );
            revert('Waste Duplicate found');
        }

        if (!Validation.validateUser(user)) {
            emit CreationReject( id, "User does not exist");
            revert('User Not found');
        }

        wasteStorage[id] = Waste(
            id,
            description,
            weight,
            user,
            "-",
            "-",
            block.timestamp,
            true
        );
        userStorage[user][id] = block.timestamp;
        emit CreateWaste(
            id,
            user,
            block.timestamp,
            "Successful Creation"
        );
    }

    /**
     * @dev Function that makes the transfer of ownership of waste to agent:
     */
    function agentOwnWaste(string memory agent, string memory id) public onlyOwner {
        if (!wasteStorage[id].exist) {
            emit TransferReject(
                agent,
                id,
                "Waste does not exist with this id"
            );
            revert('Waste Not found');
        }

        if (!Validation.validateAgent(agent)) {
            emit TransferReject(agent, id, "Agent does not exist");
            revert('Agent Not found');
        }

        wasteStorage[id].agent = agent;
        agentStorage[agent][id] = block.timestamp;
        emit TransferWaste(agent, id, "Waste transported to Agent");
    }

    /**
     * @dev Function that makes the transfer of ownership of waste to company:
     */
    function companyOwnWaste(string memory company, string memory id) public onlyOwner {
        if (!wasteStorage[id].exist) {
            emit TransferReject(
                company,
                id,
                "Waste does not exist with this id"
            );
            revert('Waste Not found');
        }

        if (!Validation.validateCompany(company)) {
            emit TransferReject(
                company,
                id,
                "Company does not exist"
            );
            revert('Company Not found');
        }

        wasteStorage[id].company = company;
        companyStorage[company][id] = block.timestamp;
        emit TransferWaste(
            company,
            id,
            "Waste transported to Company"
        );
    }

    /**
     * @dev Getter of the characteristic of waste:
     */
    function getWaste(string memory id)
        public onlyOwner
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            bool
        )
    {
        emit WasteData(
            wasteStorage[id].description,
            wasteStorage[id].weight,
            wasteStorage[id].user,
            wasteStorage[id].agent,
            wasteStorage[id].company,
            wasteStorage[id].submitDate,
            wasteStorage[id].exist
            );
        return (
            wasteStorage[id].description,
            wasteStorage[id].weight,
            wasteStorage[id].user,
            wasteStorage[id].agent,
            wasteStorage[id].company,
            wasteStorage[id].submitDate,
            wasteStorage[id].exist
        );
    }

    /**
     * @dev Funcion to check the ownership of waste from user:
     */
    function isUserOwner(string memory user, string memory id)
        public
        view
        onlyOwner
        returns (bool)
    {
        if (Validation.validateUser(user) && userStorage[user][id] != 0) {
            return true;
        }

        return false;
    }

    /**
     * @dev Funcion to check the ownership of waste from agent:
     */
    function isAgentOwner(string memory agent, string memory id)
        public
        view
        onlyOwner
        returns (bool)
    {
        if (Validation.validateAgent(agent) && agentStorage[agent][id] != 0) {
            return true;
        }

        return false;
    }

    /**
     * @dev Funcion to check the ownership of waste from company:
     */
    function isCompanyOwner(string memory company, string memory id)
        public
        view
        onlyOwner
        returns (bool)
    {
        if (Validation.validateCompany(company) && companyStorage[company][id] != 0) {
            return true;
        }

        return false;
    }

    /**
     * @dev Conclude the lifecycle of waste so rewards can be imbursed
     */
    function concludeWaste(string memory company, string memory id)
        public
        onlyOwner
    {
        if (!wasteStorage[id].exist) {
            emit TransferReject(
                company,
                id,
                "Waste does not exist with this id"
            );
            revert('Waste Not found');
        }

        if (!Validation.validateCompany(company)) {
            emit TransferReject(
                company,
                id,
                "Company does not exist"
            );
            revert('Company Not found');
        }

        wasteStorage[id].exist = false;
        emit WasteData(
            wasteStorage[id].description,
            wasteStorage[id].weight,
            wasteStorage[id].user,
            wasteStorage[id].agent,
            wasteStorage[id].company,
            wasteStorage[id].submitDate,
            wasteStorage[id].exist
            );
    }
}
