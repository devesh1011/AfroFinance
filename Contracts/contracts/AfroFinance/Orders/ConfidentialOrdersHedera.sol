// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ConfidentialOrdersHedera - Hedera Version
 * @notice Handles confidential order commitments without Chainlink Functions
 * @dev Orders are encrypted off-chain and routed through HCS, settlement happens via backend
 */
contract ConfidentialOrdersHedera is Ownable {
    event BuyOrderCreated(
        address indexed user,
        string ticker,
        address token,
        bytes32 orderCommitment
    );

    event SellOrderCreated(
        address indexed user,
        string ticker,
        address token,
        bytes32 orderCommitment
    );

    event Deposited(address indexed user, uint256 amount);

    // Track user deposits (escrowed HUSDC)
    mapping(address => uint256) public deposits;

    // Track used commitments to prevent replay
    mapping(bytes32 => bool) public usedCommitments;

    address public immutable agent;
    IERC20 public immutable usdcToken;

    constructor(address _agent, address _usdc) Ownable() {
        usdcToken = IERC20(_usdc);
        agent = _agent;
    }

    modifier onlyAgent() {
        require(msg.sender == agent, "Only agent can call this function");
        _;
    }

    /**
     * @notice Submit a buy order commitment (order details encrypted and sent to HCS separately)
     * @param ticker Asset ticker symbol
     * @param token RWA token address to receive
     * @param orderCommitment keccak256(ciphertext || iv || user) - prevents replay attacks
     */
    function buyAsset(
        string memory ticker,
        address token,
        bytes32 orderCommitment
    ) public {
        require(!usedCommitments[orderCommitment], "Commitment already used");
        require(deposits[msg.sender] > 0, "No USDC deposited");

        usedCommitments[orderCommitment] = true;

        // Emit event - backend listens to this + HCS message to process order
        emit BuyOrderCreated(msg.sender, ticker, token, orderCommitment);
    }

    /**
     * @notice Submit a sell order commitment
     * @param ticker Asset ticker symbol
     * @param token RWA token address to sell
     * @param orderCommitment keccak256(ciphertext || iv || user)
     */
    function sellAsset(
        string memory ticker,
        address token,
        bytes32 orderCommitment
    ) public {
        require(!usedCommitments[orderCommitment], "Commitment already used");

        usedCommitments[orderCommitment] = true;

        emit SellOrderCreated(msg.sender, ticker, token, orderCommitment);
    }

    /**
     * @notice Deposit HUSDC to escrow for buy orders
     * @param amount Amount of HUSDC to deposit (6 decimals)
     */
    function deposit(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        deposits[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Agent transfers deposited funds after settlement
     * @param user User whose deposit to transfer
     * @param amount Amount to transfer to agent
     */
    function transferDepositToAgent(
        address user,
        uint256 amount
    ) public onlyAgent {
        require(deposits[user] >= amount, "Insufficient user deposit");
        deposits[user] -= amount;
        require(usdcToken.transfer(agent, amount), "Transfer to agent failed");
    }

    /**
     * @notice Agent returns funds to user (e.g., order cancellation)
     * @param user User to refund
     * @param amount Amount to refund
     */
    function refundDeposit(address user, uint256 amount) public onlyAgent {
        require(deposits[user] >= amount, "Insufficient deposit");
        deposits[user] -= amount;
        require(usdcToken.transfer(user, amount), "Transfer failed");
    }

    /**
     * @notice Get user's deposited balance
     * @param user User address
     * @return Deposited USDC amount
     */
    function getDeposit(address user) external view returns (uint256) {
        return deposits[user];
    }
}
