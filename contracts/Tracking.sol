// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.9.0;

/**
 * @title Tracking
 * @dev Contract with abstraction for tracking
 */

contract Tracking {
    /**
     * @dev Define the structure for a waste submission
     */
    struct Waste {
        string id;
        string description;
        string user;
        string agent;
        string company;
        uint256 submitDate;
        bool exist;
    }

    //   struct EntityWasteData {
    //     string id;
    //     uint256 transferDate;
    //   }

    /**
     * @dev Mapping that define the storage of a product
     */
    mapping(string => Waste) private wasteStorage;

    mapping(string => bool) private userValidation;
    mapping(string => bool) private agentValidation;
    mapping(string => bool) private companyValidation;

    mapping(string => mapping(string => uint256)) private userStorage;
    mapping(string => mapping(string => uint256)) private agentStorage;
    mapping(string => mapping(string => uint256)) private companyStorage;

    /**
     * @dev Declare events according the supply chain operations:
     */
    event CreateWaste(
        address addressProducer,
        string id,
        string entity,
        uint256 CreationDate,
        string AcceptMessage
    );
    event TransferWaste(
        address addressProducer,
        string entity,
        string id,
        string AcceptMessage
    );
    //event setPrice(string id, uint32 salePrice);
    event TransferReject(
        address addressProducer,
        string entity,
        string id,
        string RejectMessage
    );
    event CreationReject(
        address addressProducer,
        string id,
        string RejectMessage
    );

    /**
     * @dev Function that create the Waste Entry:
     */
    function creationWaste(
        string memory id,
        string memory description,
        string memory user
    ) public {
        if (wasteStorage[id].exist) {
            emit CreationReject(
                msg.sender,
                id,
                "Waste for this id already exist"
            );
            return;
        }

        if (!userValidation[user]) {
            emit CreationReject(msg.sender, id, "User does not exist");
            return;
        }

        wasteStorage[id] = Waste(
            id,
            description,
            user,
            "-",
            "-",
            block.timestamp,
            true
        );
        userStorage[user][id] = block.timestamp;
        emit CreateWaste(
            msg.sender,
            id,
            user,
            block.timestamp,
            "Successful Creation"
        );
    }

    /**
     * @dev Function that makes the transfer of ownership of waste to agent:
     */
    function agentOwnWaste(string memory agent, string memory id) public {
        if (!wasteStorage[id].exist) {
            emit TransferReject(
                msg.sender,
                agent,
                id,
                "Waste does not exist with this id"
            );
            return;
        }

        if (!agentValidation[agent]) {
            emit TransferReject(msg.sender, agent, id, "Agent does not exist");
            return;
        }

        wasteStorage[id].agent = agent;
        agentStorage[agent][id] = block.timestamp;
        emit TransferWaste(msg.sender, agent, id, "Waste transported to Agent");
    }

    /**
     * @dev Function that makes the transfer of ownership of waste to company:
     */
    function companyOwnWaste(string memory company, string memory id) public {
        if (!wasteStorage[id].exist) {
            emit TransferReject(
                msg.sender,
                company,
                id,
                "Waste does not exist with this id"
            );
            return;
        }

        if (!companyValidation[company]) {
            emit TransferReject(
                msg.sender,
                company,
                id,
                "Company does not exist"
            );
            return;
        }

        wasteStorage[id].company = company;
        companyStorage[company][id] = block.timestamp;
        emit TransferWaste(
            msg.sender,
            company,
            id,
            "Waste transported to Company"
        );
    }

    /**
     * @dev Getter of the characteristic of waste:
     */
    function getProduct(string memory id)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        return (
            wasteStorage[id].description,
            wasteStorage[id].user,
            wasteStorage[id].agent,
            wasteStorage[id].company,
            wasteStorage[id].submitDate
        );
    }

    /**
     * @dev Funcion to check the ownership of waste from user:
     */
    function isUserOwner(string memory user, string memory id)
        public
        view
        returns (bool)
    {
        if (userValidation[user] && userStorage[user][id] != 0) {
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
        returns (bool)
    {
        if (agentValidation[agent] && agentStorage[agent][id] != 0) {
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
        returns (bool)
    {
        if (companyValidation[company] && companyStorage[company][id] != 0) {
            return true;
        }

        return false;
    }
}
