// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
// import "./SafeMath.sol";
import "./ValidationInterface.sol";

library SafeMath {
    
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     *
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     *
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     *
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }

    /**
     * @dev Returns the integer division of two unsigned integers, reverting on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator.
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * reverting when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     *
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return a % b;
    }

    
}

contract Reward {

    address private constant VALIDATION_CONTRACT = 0x5df848c79F19e9a8Ff59F83eD1A862da26aEbA3E;
    ValidationInterface private Validation = ValidationInterface(VALIDATION_CONTRACT);


    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(string to, string from, uint256 value, string transferMessage);
    event Balance(uint256 balance, string eventMessage);
    event Counter(uint256 counter, string eventMessage);
    event TransactionEvent(
        string from,
        string to,
        uint256[] tokens,
        uint256 amount,
        uint256 timestamp,
        bool successful,
        string eventMessage
    );
    event TransactionDataEvent(
        uint256[] tokens,
        uint256 amount,
        uint256 timestamp,
        bool successful,
        string eventMessage
    );
    event TokenEvent( 
        string name,
        string symbol,
        uint256 expires,
        string eventMessage
        );

    address private owner;
    using SafeMath for uint256;
    uint256 private _tokenCount;
    uint256 private _selfCount;
    uint256 private _transactionsCount;
    uint256 private _totalSupply;

    string private _self = "rrr-vrikrisannee";

    struct Token {
        string name;
        string symbol;
        uint256 expires;
    }

    struct TransactionData {
        uint256[] tokens;
        uint256 amount;
        uint256 timestamp;
        bool successful;
    }

    struct Transaction {
        string from;
        string to;
        uint256[] tokens;
        uint256 amount;
        uint256 timestamp;
        bool successful;
    }

    mapping(string => uint256) private _balances;
    mapping(string => mapping(string => mapping(uint256 => TransactionData))) private _transactionsData;
    mapping(uint256 => Transaction) private _transactions;
    mapping(uint256 => Token) private _tokens;

    mapping(string => uint256) private _agentCount;
    mapping(string => uint256) private _userCount;
    mapping(string => mapping(string => uint256)) private _agentUserCount;

    /**
     * @dev Sets the value for variables
     */
    constructor() {
        _totalSupply = 0;
        _tokenCount = 0;
        _selfCount = 0;
        _transactionsCount = 0;
        owner = msg.sender;
    }

    /**
     * @dev Checks the owner of the contract
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**
     * @dev Checks the amount
     */
    modifier amountThreshold(string memory account, uint256 amount) {
        require(_balances[account] >= amount);
        _;
    }

    /**
     * @dev Function that sets the new owner:
     */
    function setOwner(address newOwner) onlyOwner external {
        owner = newOwner;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name(uint256 index_) public view onlyOwner returns (string memory) {
        return _tokens[index_].name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol(uint256 index_)
        public
        view
        onlyOwner
        returns (string memory)
    {
        return _tokens[index_].symbol;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(string memory account)
        public
        onlyOwner
        returns (uint256)
    {
        emit Balance(_balances[account], "balanceOf");
        return _balances[account];
    }

    /**
     * @dev Get Agent Count
     */
    function countAgent(string memory agent)
        public
        onlyOwner
        returns (uint256)
    {
        emit Counter(_agentCount[agent], "countAgent");
        return _agentCount[agent];
    }

    /**
     * @dev Get User Count
     */
    function countUser(string memory user)
        public
        onlyOwner
        returns (uint256)
    {
        emit Counter(_userCount[user], "countUser");
        return _userCount[user];
    }

    /**
     * @dev Get Agent-User Count
     */
    function countAgentUser(string memory agent, string memory user)
        public
        onlyOwner
        returns (uint256)
    {
        emit Counter(_agentUserCount[agent][user], "countAgentUser");
        return _agentUserCount[agent][user];
    }

    /**
     * @dev Get Token Data
     */
    function getToken(uint256 tokenId)
        public
        onlyOwner
    {
        require(_tokens[tokenId].expires != 0);
        emit TokenEvent(_tokens[tokenId].name, _tokens[tokenId].symbol, _tokens[tokenId].expires, "getToken");
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the non-existing entity.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(string memory to, uint256 amount)
        public
        onlyOwner
        returns (bool)
    {
        require(Validation.validateUser(to) || Validation.validateAgent(to));
        uint256 tempBalance;
        tempBalance = _balances[to];
        _balances[to] = tempBalance.add(amount);
        uint256[] memory tokens_ = new uint256[](amount);

        for (uint256 i = 0; i < amount; i++) {
            _tokenCount = _tokenCount.add(1);
            _tokens[_tokenCount] = Token({
                name: string.concat(_self, to),
                symbol: "SELFUSER",
                expires: (block.timestamp).add(7890000)
            });
            tokens_[i] = (_tokenCount);
        }

        _selfCount = _selfCount.add(1);
        _transactionsData[_self][to][_selfCount] = TransactionData({
            tokens: tokens_,
            amount: amount,
            timestamp: block.timestamp,
            successful: true
        });

        _transactionsCount = _transactionsCount.add(1);
        _transactions[_transactionsCount] = Transaction({
            from: _self,
            to: to,
            tokens: tokens_,
            amount: amount,
            timestamp: block.timestamp,
            successful: true
        });
        emit Transfer(to, "self", amount, "transfer");
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP.
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the non-existing entities.
     * - `from` must have a balance of at least `amount`.
     *
     */
    function transferFrom(
        string memory from,
        string memory to,
        uint256 amount
    ) public onlyOwner amountThreshold(from, amount) returns (bool) {
        require(Validation.validateUser(to) && Validation.validateAgent(from));
        uint256 userBalance;
        uint256 agentBalance;
        userBalance = _balances[to];
        agentBalance = _balances[from];
        _balances[to] = userBalance.add(amount);
        _balances[from] = agentBalance.sub(amount);
        uint256[] memory tokens_ = new uint256[](amount);

        for (uint256 i = 0; i < amount; i++) {
            _tokenCount = _tokenCount.add(1);
            _tokens[_tokenCount] = Token({
                name: string.concat(from, to),
                symbol: "AGENUSER",
                expires: (block.timestamp).add(7890000)
            });
            tokens_[i] = (_tokenCount);
        }

        _userCount[to] = (_userCount[to]).add(1);
        _agentCount[from] = (_agentCount[from]).add(1);
        _agentUserCount[from][to] = (_agentUserCount[from][to]).add(1);

        _transactionsData[from][to][
            _agentUserCount[from][to]
        ] = TransactionData({
            tokens: tokens_,
            amount: amount,
            timestamp: block.timestamp,
            successful: true
        });

        _transactionsCount = _transactionsCount.add(1);
        _transactions[_transactionsCount] = Transaction({
            from: from,
            to: to,
            tokens: tokens_,
            amount: amount,
            timestamp: block.timestamp,
            successful: true
        });
        emit Transfer(to, from, amount, "transferFrom");
        return true;
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to self.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(string memory account, uint256 amount) internal onlyOwner {
        _beforeTokenTransfer(_self, account, amount);
        require(Validation.validateAgent(account));
        _totalSupply += amount;
        // unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _balances[account] = (_balances[account]).add(amount);
        // }
        emit Transfer(account, "self", amount, "Minting");

        _afterTokenTransfer(_self, account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the existing entity.
     *
     * Requirements:
     *
     * - `account` cannot be the non-existing entity.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(string memory account, uint256 amount) internal onlyOwner {
        _beforeTokenTransfer(account, _self, amount);
        require(Validation.validateUser(account));
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        // unchecked {
            _balances[account] = accountBalance.sub(amount);
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply = _totalSupply.sub(amount);
        // }

        emit Transfer("self", account, amount, "Burning");

        _afterTokenTransfer(account, _self, amount);
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both existing entities, `amount` of ``from``'s tokens
     * will be transferred to `to`.
     * - when `from` is self, `amount` tokens will be minted for `to`.
     * - when `to` is self, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both non-existing entities.
     *
     */
    function _beforeTokenTransfer(
        string memory from,
        string memory to,
        uint256 amount
    ) internal onlyOwner {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both existing entities, `amount` of ``from``'s tokens
     * has been transferred to `to`.
     * - when `from` is self, `amount` tokens have been minted for `to`.
     * - when `to` is self, `amount` of ``from``'s tokens have been burned.
     * - `from` and `to` are never both non-existing entities.
     *
     */
    function _afterTokenTransfer(
        string memory from,
        string memory to,
        uint256 amount
    ) internal onlyOwner {}
}
