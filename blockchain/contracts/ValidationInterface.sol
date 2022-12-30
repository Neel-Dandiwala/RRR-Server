// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

interface ValidationInterface {

    function validateUser(string memory user) external view returns (bool);

    function validateAgent(string memory agent) external view returns (bool);

    function validateCompany(string memory company) external view returns (bool);

}