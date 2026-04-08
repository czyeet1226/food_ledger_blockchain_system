// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FoodLedger {
    // ===== Roles =====
    enum Role { None, Admin, Merchant, Customer }

    // ===== Structs =====
    struct UserInfo {
        Role role;
        string name;
        bool isActive;
        uint256 registeredAt;
    }

    struct MembershipPlan {
        uint256 id;
        address merchant;
        string title;
        string description;
        uint256 priceInWei;
        uint256 durationDays;
        uint256 maxSupply;
        uint256 sold;
        bool isActive;
    }

    struct Purchase {
        uint256 id;
        uint256 planId;
        address buyer;
        address merchant;
        uint256 amountPaid;
        uint256 purchasedAt;
        uint256 expiresAt;
    }

    // ===== State =====
    address public owner;
    uint256 public nextPlanId;
    uint256 public nextPurchaseId;

    mapping(address => UserInfo) public users;
    mapping(uint256 => MembershipPlan) public plans;
    mapping(uint256 => Purchase) public purchases;

    // Track data per user
    mapping(address => uint256[]) public buyerPurchases;
    mapping(address => uint256[]) public merchantPurchases;
    mapping(address => uint256[]) public merchantPlans;

    // Track all registered addresses by role
    address[] public allMerchants;
    address[] public allCustomers;

    // ===== Events =====
    event UserRegistered(address indexed user, Role role, string name);
    event PlanCreated(uint256 indexed planId, address indexed merchant, string title, uint256 priceInWei);
    event MembershipPurchased(uint256 indexed purchaseId, uint256 indexed planId, address indexed buyer, address merchant, uint256 amountPaid);
    event PlanToggled(uint256 indexed planId, bool isActive);

    // ===== Modifiers =====
    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.Admin, "Not admin");
        _;
    }

    modifier onlyMerchant() {
        require(users[msg.sender].role == Role.Merchant, "Not merchant");
        _;
    }

    modifier onlyCustomer() {
        require(users[msg.sender].role == Role.Customer, "Not customer");
        _;
    }

    // ===== Constructor =====
    constructor() {
        owner = msg.sender;
        // Deployer is automatically the admin
        users[msg.sender] = UserInfo({
            role: Role.Admin,
            name: "Platform Admin",
            isActive: true,
            registeredAt: block.timestamp
        });
        emit UserRegistered(msg.sender, Role.Admin, "Platform Admin");
    }

    // ===== Registration =====
    function registerAsMerchant(string memory _name) external {
        require(users[msg.sender].role == Role.None, "Already registered");
        users[msg.sender] = UserInfo({
            role: Role.Merchant,
            name: _name,
            isActive: true,
            registeredAt: block.timestamp
        });
        allMerchants.push(msg.sender);
        emit UserRegistered(msg.sender, Role.Merchant, _name);
    }

    function registerAsCustomer(string memory _name) external {
        require(users[msg.sender].role == Role.None, "Already registered");
        users[msg.sender] = UserInfo({
            role: Role.Customer,
            name: _name,
            isActive: true,
            registeredAt: block.timestamp
        });
        allCustomers.push(msg.sender);
        emit UserRegistered(msg.sender, Role.Customer, _name);
    }

    // Admin can register other admins
    function registerAdmin(address _addr, string memory _name) external onlyAdmin {
        require(users[_addr].role == Role.None, "Already registered");
        users[_addr] = UserInfo({
            role: Role.Admin,
            name: _name,
            isActive: true,
            registeredAt: block.timestamp
        });
        emit UserRegistered(_addr, Role.Admin, _name);
    }

    // ===== Merchant: Create a plan =====
    function createPlan(
        string memory _title,
        string memory _description,
        uint256 _priceInWei,
        uint256 _durationDays,
        uint256 _maxSupply
    ) external onlyMerchant {
        require(_priceInWei > 0, "Price must be > 0");
        require(_maxSupply > 0, "Max supply must be > 0");

        uint256 planId = nextPlanId++;
        plans[planId] = MembershipPlan({
            id: planId,
            merchant: msg.sender,
            title: _title,
            description: _description,
            priceInWei: _priceInWei,
            durationDays: _durationDays,
            maxSupply: _maxSupply,
            sold: 0,
            isActive: true
        });

        merchantPlans[msg.sender].push(planId);
        emit PlanCreated(planId, msg.sender, _title, _priceInWei);
    }

    // ===== Customer: Buy a membership =====
    function purchaseMembership(uint256 _planId) external payable onlyCustomer {
        MembershipPlan storage plan = plans[_planId];
        require(plan.isActive, "Plan is not active");
        require(plan.sold < plan.maxSupply, "Sold out");
        require(msg.value == plan.priceInWei, "Incorrect ETH amount");
        require(plan.merchant != msg.sender, "Cannot buy your own plan");

        // Pay the merchant directly
        (bool sent, ) = plan.merchant.call{value: msg.value}("");
        require(sent, "Payment failed");

        // Record the purchase
        uint256 purchaseId = nextPurchaseId++;
        purchases[purchaseId] = Purchase({
            id: purchaseId,
            planId: _planId,
            buyer: msg.sender,
            merchant: plan.merchant,
            amountPaid: msg.value,
            purchasedAt: block.timestamp,
            expiresAt: block.timestamp + (plan.durationDays * 1 days)
        });

        plan.sold++;
        buyerPurchases[msg.sender].push(purchaseId);
        merchantPurchases[plan.merchant].push(purchaseId);

        emit MembershipPurchased(purchaseId, _planId, msg.sender, plan.merchant, msg.value);
    }

    // ===== Merchant: Toggle plan =====
    function togglePlan(uint256 _planId) external onlyMerchant {
        require(plans[_planId].merchant == msg.sender, "Not your plan");
        plans[_planId].isActive = !plans[_planId].isActive;
        emit PlanToggled(_planId, plans[_planId].isActive);
    }

    // ===== Read functions =====
    function getUser(address _addr) external view returns (UserInfo memory) {
        return users[_addr];
    }

    function getMyRole() external view returns (Role) {
        return users[msg.sender].role;
    }

    function getPlan(uint256 _planId) external view returns (MembershipPlan memory) {
        return plans[_planId];
    }

    function getPurchase(uint256 _purchaseId) external view returns (Purchase memory) {
        return purchases[_purchaseId];
    }

    function getBuyerPurchases(address _buyer) external view returns (uint256[] memory) {
        return buyerPurchases[_buyer];
    }

    function getMerchantPurchases(address _merchant) external view returns (uint256[] memory) {
        return merchantPurchases[_merchant];
    }

    function getMerchantPlans(address _merchant) external view returns (uint256[] memory) {
        return merchantPlans[_merchant];
    }

    function getAllMerchants() external view returns (address[] memory) {
        return allMerchants;
    }

    function getAllCustomers() external view returns (address[] memory) {
        return allCustomers;
    }

    function getTotalPlans() external view returns (uint256) {
        return nextPlanId;
    }

    function getTotalPurchases() external view returns (uint256) {
        return nextPurchaseId;
    }

    function isMembershipValid(uint256 _purchaseId) external view returns (bool) {
        Purchase memory p = purchases[_purchaseId];
        return p.buyer != address(0) && block.timestamp <= p.expiresAt;
    }
}
