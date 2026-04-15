// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FoodLedger {
    // ===== Roles =====
    enum Role { None, Admin, Merchant, Customer }
    enum MerchantStatus { Pending, Approved, Rejected }

    // ===== Structs =====
    struct UserInfo {
        Role role;
        string name;
        bool isActive;
        uint256 registeredAt;
    }

    struct MerchantRegistration {
        address merchant;
        string name;
        MerchantStatus status;
        uint256 requestedAt;
        uint256 reviewedAt;
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
    uint256 public nextMerchantRegistrationId;

    mapping(address => UserInfo) public users;
    mapping(uint256 => MembershipPlan) public plans;
    mapping(uint256 => Purchase) public purchases;

    // Merchant registration approval workflow
    mapping(uint256 => MerchantRegistration) public merchantRegistrations;
    mapping(address => uint256) public merchantRegistrationId; // address => registration ID

    // Track data per user
    mapping(address => uint256[]) public buyerPurchases;
    mapping(address => uint256[]) public merchantPurchases;
    mapping(address => uint256[]) public merchantPlans;

    // Track all registered addresses by role
    address[] public allMerchants;
    address[] public allCustomers;
    uint256[] public pendingMerchantRegistrations;

    // ===== Events =====
    event UserRegistered(address indexed user, Role role, string name);
    event MerchantRegistrationRequested(uint256 indexed registrationId, address indexed merchant, string name);
    event MerchantRegistrationApproved(uint256 indexed registrationId, address indexed merchant);
    event MerchantRegistrationRejected(uint256 indexed registrationId, address indexed merchant);
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
        // Start registration IDs at 1 so 0 means "no registration"
        nextMerchantRegistrationId = 1;
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
        require(merchantRegistrationId[msg.sender] == 0, "Already submitted registration");
        
        uint256 regId = nextMerchantRegistrationId++;
        merchantRegistrations[regId] = MerchantRegistration({
            merchant: msg.sender,
            name: _name,
            status: MerchantStatus.Pending,
            requestedAt: block.timestamp,
            reviewedAt: 0
        });
        
        merchantRegistrationId[msg.sender] = regId;
        pendingMerchantRegistrations.push(regId);
        
        emit MerchantRegistrationRequested(regId, msg.sender, _name);
    }

    function approveMerchantRegistration(uint256 _regId) external onlyAdmin {
        MerchantRegistration storage reg = merchantRegistrations[_regId];
        require(reg.merchant != address(0), "Registration not found");
        require(reg.status == MerchantStatus.Pending, "Not pending");
        
        // Update registration status
        reg.status = MerchantStatus.Approved;
        reg.reviewedAt = block.timestamp;
        
        // Register as merchant
        users[reg.merchant] = UserInfo({
            role: Role.Merchant,
            name: reg.name,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        allMerchants.push(reg.merchant);
        
        // Remove from pending list
        _removePendingRegistration(_regId);
        
        emit MerchantRegistrationApproved(_regId, reg.merchant);
        emit UserRegistered(reg.merchant, Role.Merchant, reg.name);
    }

    function rejectMerchantRegistration(uint256 _regId) external onlyAdmin {
        MerchantRegistration storage reg = merchantRegistrations[_regId];
        require(reg.merchant != address(0), "Registration not found");
        require(reg.status == MerchantStatus.Pending, "Not pending");
        
        reg.status = MerchantStatus.Rejected;
        reg.reviewedAt = block.timestamp;
        
        // Clear registration ID so merchant can re-register
        merchantRegistrationId[reg.merchant] = 0;
        
        // Remove from pending list
        _removePendingRegistration(_regId);
        
        emit MerchantRegistrationRejected(_regId, reg.merchant);
    }

    function _removePendingRegistration(uint256 _regId) internal {
        for (uint256 i = 0; i < pendingMerchantRegistrations.length; i++) {
            if (pendingMerchantRegistrations[i] == _regId) {
                pendingMerchantRegistrations[i] = pendingMerchantRegistrations[pendingMerchantRegistrations.length - 1];
                pendingMerchantRegistrations.pop();
                break;
            }
        }
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

    // ===== Merchant Registration Approval Getters =====
    function getMerchantRegistration(uint256 _regId) external view returns (MerchantRegistration memory) {
        return merchantRegistrations[_regId];
    }

    function getPendingMerchantRegistrations() external view returns (uint256[] memory) {
        return pendingMerchantRegistrations;
    }

    function getPendingMerchantRegistrationsCount() external view returns (uint256) {
        return pendingMerchantRegistrations.length;
    }

    function getTotalMerchantRegistrations() external view returns (uint256) {
        return nextMerchantRegistrationId;
    }
}
