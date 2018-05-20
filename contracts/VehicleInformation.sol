pragma solidity ^0.4.19;

contract VehicleInformation {
    enum VehicleState {UNKNOWN, NOT_REGISTERED, REGISTERED, UTILIZED}
    struct VehicleData {
        VehicleState vehicleState;
        uint256 lastKilometerage;
        uint256 insuranceExpiryTimestampUTC;
        uint256 lastInspectionTimestampUTC;
        bool lastInspectionResult;
    }

    struct Roles {
        bool isClerk;
        bool isMechanic;
        bool isInsurer;
    }

    address masterClerk;
    mapping(bytes17 => VehicleData) public vinData;
    mapping(address => Roles) public roleStorage;

    modifier onlyClerk() {
        require(roleStorage[msg.sender].isClerk == true);
        _;
    }

    modifier onlyMechanic() {
        require(roleStorage[msg.sender].isMechanic == true);
        _;
    }

    modifier onlyClerkOrInsurer() {
        require(roleStorage[msg.sender].isClerk == true || roleStorage[msg.sender].isInsurer == true);
        _;
    }

    modifier onlyClerkOrMechanic() {
        require(roleStorage[msg.sender].isClerk == true || roleStorage[msg.sender].isMechanic == true);
        _;
    }

    function VehicleInformation() public payable {
        masterClerk = msg.sender;
        roleStorage[msg.sender].isClerk = true;
    }

    function grantClerkRole(address _address) onlyClerk public {
        roleStorage[_address].isClerk = true;
    }

    function revokeClerkRole(address _address) onlyClerk public {
        assert(_address != masterClerk);
        roleStorage[_address].isClerk = false;
    }

    function grantInsurerRole(address _address) onlyClerk public {
        roleStorage[_address].isInsurer = true;
    }

    function revokeInsurerRole(address _address) onlyClerk public {
        roleStorage[_address].isInsurer = false;
    }

    function grantMechanicRole(address _address) onlyClerk public {
        roleStorage[_address].isMechanic = true;
    }

    function revokeMechanicRole(address _address) onlyClerk public {
        roleStorage[_address].isMechanic = false;
    }

    function getVehicleKilometrage(bytes17 vin) public view returns (uint256) {
        return vinData[vin].lastKilometerage;
    }

    function setVehicleKilometrage(bytes17 vin, uint256 kilometrage) onlyClerkOrMechanic public payable {
        if (!roleStorage[msg.sender].isClerk) {
            assert(kilometrage >= vinData[vin].lastKilometerage);
        }
        vinData[vin].lastKilometerage = kilometrage;
    }

    function setLastInspectionResult(bytes17 vin, bool result) onlyClerkOrMechanic public payable {
        vinData[vin].lastInspectionResult = result;
    }

    function getLastInspectionResult(bytes17 vin) public view returns (bool) {
        return vinData[vin].lastInspectionResult;
    }

    function setLastInspectionTimestampUTC(bytes17 vin, uint256 timestamp) onlyClerkOrMechanic public payable {
        vinData[vin].lastInspectionTimestampUTC = timestamp;
    }

    function getLastInspectionTimestampUTC(bytes17 vin) public view returns (uint256) {
        return vinData[vin].lastInspectionTimestampUTC;
    }

    function setInsuranceExpiryTimestamp(bytes17 vin, uint256 timestamp) onlyClerkOrInsurer public payable {
        vinData[vin].insuranceExpiryTimestampUTC = timestamp;
    }

    function getInsuranceExpiryTimestamp(bytes17 vin) public view returns (uint256) {
        return vinData[vin].insuranceExpiryTimestampUTC;
    }

    function getVehicleState(bytes17 vin) public view returns (VehicleState) {
        return vinData[vin].vehicleState;
    }

    function setVehicleState(bytes17 vin, uint newState) public payable onlyClerk {
        if (newState == uint(VehicleState.NOT_REGISTERED)) {
            vinData[vin].vehicleState = VehicleState.NOT_REGISTERED;
        } else if (newState == uint(VehicleState.REGISTERED)) {
            vinData[vin].vehicleState = VehicleState.REGISTERED;
        } else if (newState == uint(VehicleState.UTILIZED)) {
            vinData[vin].vehicleState = VehicleState.UTILIZED;
        } else {
            revert();
        }
    }

    function () public {
        revert();
    }
}
