// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RestaurantMembership is ERC721 {

    struct Membership {
        address vendor;
        string membershipType;
        string benefits;
        uint256 expiry;
        string membershipImageURI;
    }

    uint256 public tokenIdCounter;

    mapping(uint256 => Membership) public memberships;

    mapping(uint256 => string) public membershipPictures;
    mapping(address => string) public profilePicURI;

    // store membership price per vendor + type
    mapping(address => mapping(string => uint256)) public membershipPrices;

    mapping(address => uint256) public lastLogin;

    event MembershipPriceSet(address indexed vendor, string membershipType, uint256 price);
    event MembershipPurchased(uint256 indexed tokenId, address indexed buyer, address indexed vendor, string membershipType, uint256 expiry);
    event ProfilePicUpdated(address indexed account, string uri);
    event MembershipPicUpdated(uint256 indexed tokenId, string uri);
    event MembershipLoggedIn(address indexed user, address indexed vendor, uint256 timestamp);

    constructor() ERC721("RestaurantMembership", "RMEM") {}

    //  Vendor sets membership price
    function setMembershipPrice(
        string memory membershipType,
        uint256 price
    ) public {
        membershipPrices[msg.sender][membershipType] = price;
        emit MembershipPriceSet(msg.sender, membershipType, price);
    }

    function setProfilePic(string calldata uri) external {
        profilePicURI[msg.sender] = uri;
        emit ProfilePicUpdated(msg.sender, uri);
    }

    function setMembershipPic(uint256 tokenId, string calldata uri) external {
        require(_exists(tokenId), "Token does not exist");
        require(memberships[tokenId].vendor == msg.sender, "Only vendor can set membership picture");

        membershipPictures[tokenId] = uri;
        emit MembershipPicUpdated(tokenId, uri);
    }

    function _exists(uint256 tokenId) internal view override returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function getMembershipPic(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return membershipPictures[tokenId];
    }

    //  Customer buys membership
    function buyMembership(
        address vendor,
        string memory membershipType,
        string memory benefits,
        uint256 duration
    ) public payable {

        uint256 price = membershipPrices[vendor][membershipType];

        require(price > 0, "Membership not available");
        require(msg.value >= price, "Insufficient payment");

        uint256 tokenId = tokenIdCounter++;

        memberships[tokenId] = Membership(
            vendor,
            membershipType,
            benefits,
            block.timestamp + duration,
            ""
        );

        _mint(msg.sender, tokenId);

        //  Transfer payment to vendor
        payable(vendor).transfer(msg.value);

        emit MembershipPurchased(tokenId, msg.sender, vendor, membershipType, block.timestamp + duration);
    }

    function verifyMembership(address user, address vendor)
        public view returns (bool)
    {
        for (uint i = 0; i < tokenIdCounter; i++) {
            if (
                ownerOf(i) == user &&
                memberships[i].vendor == vendor &&
                memberships[i].expiry > block.timestamp
            ) {
                return true;
            }
        }
        return false;
    }

    function loginMembership(address vendor) external returns (bool) {
        bool valid = verifyMembership(msg.sender, vendor);
        require(valid, "No active membership for this vendor");

        lastLogin[msg.sender] = block.timestamp;
        emit MembershipLoggedIn(msg.sender, vendor, block.timestamp);
        return true;
    }
}
