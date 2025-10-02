// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LQDToken
 * @dev Simple mintable ERC20 token for Afro Finance MVP
 * @notice This is a Phase 1 implementation. Will be upgraded to ERC-3643 compliant token in Phase 2.
 */
contract LQDToken is ERC20, Ownable {
    // Authorized agents who can mint tokens (e.g., Reserve contract)
    mapping(address => bool) public agents;

    event AgentAdded(address indexed agent);
    event AgentRemoved(address indexed agent);
    event TokensMinted(
        address indexed to,
        uint256 amount,
        address indexed minter
    );
    event TokensBurned(address indexed from, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) {
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Modifier to check if caller is an agent or owner
     */
    modifier onlyAgentOrOwner() {
        require(
            agents[msg.sender] || msg.sender == owner(),
            "LQDToken: caller is not an agent or owner"
        );
        _;
    }

    /**
     * @dev Add an agent (e.g., Reserve contract) that can mint tokens
     * @param agent Address to be added as agent
     */
    function addAgent(address agent) external onlyOwner {
        require(agent != address(0), "LQDToken: agent is zero address");
        require(!agents[agent], "LQDToken: agent already added");

        agents[agent] = true;
        emit AgentAdded(agent);
    }

    /**
     * @dev Remove an agent
     * @param agent Address to be removed as agent
     */
    function removeAgent(address agent) external onlyOwner {
        require(agents[agent], "LQDToken: agent not found");

        agents[agent] = false;
        emit AgentRemoved(agent);
    }

    /**
     * @dev Check if an address is an agent
     * @param account Address to check
     * @return bool True if address is an agent
     */
    function isAgent(address account) external view returns (bool) {
        return agents[account];
    }

    /**
     * @dev Mint tokens to a specified address
     * @notice Can only be called by agents or owner
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyAgentOrOwner {
        require(to != address(0), "LQDToken: mint to zero address");
        require(amount > 0, "LQDToken: mint amount must be greater than 0");

        _mint(to, amount);
        emit TokensMinted(to, amount, msg.sender);
    }

    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        require(amount > 0, "LQDToken: burn amount must be greater than 0");

        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from a specified address (requires approval)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external {
        require(amount > 0, "LQDToken: burn amount must be greater than 0");

        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }

    /**
     * @dev Returns the number of decimals used for token amounts
     * @notice Using 18 decimals (standard for ERC20)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
