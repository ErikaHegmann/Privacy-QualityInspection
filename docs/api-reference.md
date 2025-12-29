# API Reference

Complete API reference for the Anonymous Quality Testing smart contract and automation tools.

## Smart Contract API

### PrivacyQualityInspection.sol

#### State Variables

```solidity
address public owner
```
Contract owner with administrative privileges.

```solidity
uint256 public inspectionCount
```
Total number of inspections recorded.

```solidity
uint256 public constant MAX_QUALITY_SCORE = 100
```
Maximum allowed quality score value.

```solidity
uint8 public constant QUALITY_THRESHOLD = 70
```
Minimum quality score considered passing.

```solidity
mapping(address => bool) public authorizedInspectors
```
Tracks which addresses are authorized as inspectors.

```solidity
bool public contractPaused
```
Emergency pause state of the contract.

#### Events

```solidity
event InspectionRecorded(
    uint256 indexed inspectionId,
    address indexed inspector,
    string category,
    uint256 timestamp
)
```
Emitted when a new inspection is recorded.

```solidity
event InspectionVerified(uint256 indexed inspectionId, address indexed verifier)
```
Emitted when an inspection is verified by another inspector.

```solidity
event MetricsUpdated(string indexed category, uint256 totalCount)
```
Emitted when category metrics are calculated.

```solidity
event InspectorAuthorized(address indexed inspector, address indexed authorizer)
```
Emitted when an inspector is authorized.

```solidity
event QualityAlert(string indexed category, uint256 inspectionId)
```
Emitted when quality issues are detected.

#### Functions

##### authorizeInspector

```solidity
function authorizeInspector(address _inspector) external onlyOwner
```

Authorizes an address to perform quality inspections.

**Parameters:**
- `_inspector` - Address to authorize

**Requirements:**
- Only owner can call
- Inspector address must be valid
- Inspector must not be already authorized

**Emits:** `InspectorAuthorized`

##### revokeInspector

```solidity
function revokeInspector(address _inspector) external onlyOwner
```

Revokes an inspector's authorization.

**Parameters:**
- `_inspector` - Address to revoke

**Requirements:**
- Only owner can call
- Inspector must be currently authorized

##### recordInspection

```solidity
function recordInspection(
    uint8 _qualityScore,
    uint8 _defectCount,
    uint32 _productBatch,
    string memory _productCategory
) external onlyAuthorizedInspector
```

Records an encrypted quality inspection.

**Parameters:**
- `_qualityScore` - Quality score (0-100), encrypted on-chain
- `_defectCount` - Number of defects, encrypted on-chain
- `_productBatch` - Product batch number, encrypted on-chain
- `_productCategory` - Product category (plaintext)

**Requirements:**
- Caller must be authorized inspector
- Quality score must be ≤ 100
- Category must not be empty

**Emits:** `InspectionRecorded`

**Side Effects:**
- Increments `inspectionCount`
- Stores encrypted inspection data
- Grants FHE permissions

##### verifyInspection

```solidity
function verifyInspection(uint256 _inspectionId)
    external
    validInspectionId(_inspectionId)
    onlyAuthorizedInspector
```

Verifies a recorded inspection.

**Parameters:**
- `_inspectionId` - ID of inspection to verify

**Requirements:**
- Caller must be authorized inspector
- Inspection must exist
- Inspection must not be already verified
- Caller cannot verify their own inspection

**Emits:** `InspectionVerified`

##### calculateCategoryMetrics

```solidity
function calculateCategoryMetrics(string memory _category) external onlyOwner
```

Calculates privacy-preserving quality metrics for a category.

**Parameters:**
- `_category` - Product category to analyze

**Requirements:**
- Only owner can call

**Emits:** `MetricsUpdated`

**Returns:** Encrypted metrics stored on-chain

##### getInspectionInfo

```solidity
function getInspectionInfo(uint256 _inspectionId)
    external
    view
    validInspectionId(_inspectionId)
    returns (
        address inspector,
        uint256 timestamp,
        bool isVerified,
        string memory productCategory,
        bytes32 inspectionHash
    )
```

Retrieves non-encrypted inspection information.

**Parameters:**
- `_inspectionId` - Inspection ID

**Returns:**
- `inspector` - Address of inspector who recorded
- `timestamp` - Unix timestamp of recording
- `isVerified` - Verification status
- `productCategory` - Product category
- `inspectionHash` - Data integrity hash

##### getInspectorHistoryCount

```solidity
function getInspectorHistoryCount(address _inspector)
    external
    view
    returns (uint256)
```

Gets the number of inspections performed by an inspector.

**Parameters:**
- `_inspector` - Inspector address

**Returns:** Count of inspections

##### getInspectorInspections

```solidity
function getInspectorInspections(
    address _inspector,
    uint256 _offset,
    uint256 _limit
) external view returns (uint256[] memory)
```

Gets paginated list of inspection IDs for an inspector.

**Parameters:**
- `_inspector` - Inspector address
- `_offset` - Starting index
- `_limit` - Maximum number of results

**Returns:** Array of inspection IDs

##### hasCategoryMetrics

```solidity
function hasCategoryMetrics(string memory _category)
    external
    view
    returns (bool)
```

Checks if metrics have been calculated for a category.

**Parameters:**
- `_category` - Category name

**Returns:** True if metrics exist

##### pauseContract / unpauseContract

```solidity
function pauseContract() external onlyOwner
function unpauseContract() external onlyOwner
```

Emergency pause/unpause contract operations.

**Requirements:**
- Only owner can call

##### getContractStats

```solidity
function getContractStats()
    external
    view
    returns (
        uint256 totalInspections,
        uint256 totalInspectors,
        address contractOwner
    )
```

Gets overall contract statistics.

**Returns:**
- `totalInspections` - Total number of inspections
- `totalInspectors` - Total authorized inspectors
- `contractOwner` - Owner address

## Automation Scripts API

### generate-docs.ts

#### Functions

```typescript
function generateExampleDoc(config: ExampleConfig): string
```

Generates GitBook-compatible documentation for an example.

**Parameters:**
- `config` - Example configuration object

**Returns:** Markdown documentation string

```typescript
function generateSummary(config: ExampleConfig): string
```

Generates SUMMARY.md for GitBook navigation.

**Parameters:**
- `config` - Example configuration

**Returns:** SUMMARY.md content

```typescript
function generateGettingStarted(): string
```

Generates Getting Started guide.

**Returns:** Getting Started markdown

### create-fhevm-example.ts

#### Functions

```typescript
function getExampleMetadata(exampleName: string): ExampleMetadata
```

Retrieves metadata for a specific example.

**Parameters:**
- `exampleName` - Name of example (e.g., "fhe-counter")

**Returns:** Example metadata object

**Throws:** Error if example not found

```typescript
function generateReadme(metadata: ExampleMetadata): string
```

Generates README for standalone example.

**Parameters:**
- `metadata` - Example metadata

**Returns:** README markdown content

#### CLI Usage

```bash
ts-node scripts/create-fhevm-example.ts <example-name> <output-path>

# Examples:
ts-node scripts/create-fhevm-example.ts fhe-counter ./my-counter
ts-node scripts/create-fhevm-example.ts privacy-quality-inspection ./my-qc
```

**Available Examples:**
- `fhe-counter` - Simple encrypted counter
- `encrypt-single` - Single value encryption
- `encrypt-multiple` - Multiple value encryption
- `user-decrypt-single` - Single value user decryption
- `user-decrypt-multiple` - Multiple value user decryption
- `public-decrypt` - Public decryption pattern
- `access-control` - Access control with FHE
- `blind-auction` - Sealed-bid auction
- `privacy-quality-inspection` - Quality inspection system

### create-fhevm-category.ts

#### Functions

```typescript
function getCategoryConfig(categoryName: string): CategoryConfig
```

Retrieves configuration for a category.

**Parameters:**
- `categoryName` - Name of category (e.g., "basic")

**Returns:** Category configuration object

**Throws:** Error if category not found

```typescript
function generateCategoryReadme(config: CategoryConfig): string
```

Generates README for category project.

**Parameters:**
- `config` - Category configuration

**Returns:** README markdown content

#### CLI Usage

```bash
ts-node scripts/create-fhevm-category.ts <category> <output-path>

# Examples:
ts-node scripts/create-fhevm-category.ts basic ./basic-examples
ts-node scripts/create-fhevm-category.ts advanced ./advanced-examples
```

**Available Categories:**
- `basic` - Fundamental FHE concepts (5 examples)
- `encryption` - Encryption patterns (2 examples)
- `decryption` - Decryption patterns (3 examples)
- `advanced` - Complex implementations (3 examples)

## Hardhat Tasks API

### task:address

Gets the deployed contract address.

```bash
npx hardhat --network localhost task:address
```

### task:inspection-count

Gets total number of inspections.

```bash
npx hardhat --network localhost task:inspection-count [--address CONTRACT_ADDRESS]
```

**Options:**
- `--address` - Optional contract address (defaults to deployed)

### task:authorize

Authorizes an inspector.

```bash
npx hardhat --network localhost task:authorize \
  --inspector 0x... \
  [--address CONTRACT_ADDRESS]
```

**Required:**
- `--inspector` - Address to authorize

**Options:**
- `--address` - Optional contract address

### task:revoke

Revokes inspector authorization.

```bash
npx hardhat --network localhost task:revoke \
  --inspector 0x... \
  [--address CONTRACT_ADDRESS]
```

**Required:**
- `--inspector` - Address to revoke

**Options:**
- `--address` - Optional contract address

### task:record

Records a new inspection.

```bash
npx hardhat --network localhost task:record \
  --quality 85 \
  --defects 2 \
  --batch 1001 \
  --category "Electronics" \
  [--address CONTRACT_ADDRESS]
```

**Required:**
- `--quality` - Quality score (0-100)
- `--defects` - Defect count
- `--batch` - Batch number
- `--category` - Product category

**Options:**
- `--address` - Optional contract address

### task:verify

Verifies an inspection.

```bash
npx hardhat --network localhost task:verify \
  --id 0 \
  [--address CONTRACT_ADDRESS]
```

**Required:**
- `--id` - Inspection ID to verify

**Options:**
- `--address` - Optional contract address

### task:info

Gets inspection information.

```bash
npx hardhat --network localhost task:info \
  --id 0 \
  [--address CONTRACT_ADDRESS]
```

**Required:**
- `--id` - Inspection ID

**Options:**
- `--address` - Optional contract address

### task:calculate-metrics

Calculates category metrics.

```bash
npx hardhat --network localhost task:calculate-metrics \
  --category "Electronics" \
  [--address CONTRACT_ADDRESS]
```

**Required:**
- `--category` - Product category

**Options:**
- `--address` - Optional contract address

## npm Scripts API

### Compilation & Building

```bash
npm run compile          # Compile Solidity contracts
npm run build:ts         # Build TypeScript code
npm run clean            # Clean build artifacts
npm run typechain        # Generate TypeScript types
```

### Testing

```bash
npm run test             # Run all tests
npm run test:sepolia     # Run tests on Sepolia
npm run coverage         # Generate coverage report
```

### Code Quality

```bash
npm run lint             # Run all linters
npm run lint:sol         # Lint Solidity code
npm run lint:ts          # Lint TypeScript code
npm run prettier:check   # Check code formatting
npm run prettier:write   # Auto-format code
```

### Deployment

```bash
npm run chain            # Start local blockchain
npm run deploy:localhost # Deploy to localhost
npm run deploy:sepolia   # Deploy to Sepolia
npm run verify:sepolia   # Verify contract on Etherscan
```

### Documentation & Automation

```bash
npm run generate-docs    # Generate GitBook documentation
npm run create-example   # Create standalone example
npm run create-category  # Create category project
npm run help:create-example   # Show example creation help
npm run help:create-category  # Show category creation help
```

## Error Codes

### Contract Errors

| Error | Description | Resolution |
|-------|-------------|------------|
| "Not authorized" | Caller is not contract owner | Use owner account |
| "Not authorized inspector" | Caller is not authorized as inspector | Get authorization from owner |
| "Invalid inspector address" | Zero address provided | Provide valid Ethereum address |
| "Inspector already authorized" | Trying to re-authorize | Inspector is already active |
| "Inspector not authorized" | Trying to revoke non-inspector | Check inspector status first |
| "Quality score exceeds maximum" | Quality score > 100 | Use value ≤ 100 |
| "Product category required" | Empty category string | Provide non-empty category |
| "Invalid inspection ID" | ID >= inspectionCount | Use valid inspection ID |
| "Already verified" | Inspection already verified | Cannot re-verify |
| "Cannot verify own inspection" | Self-verification attempt | Use different inspector |
| "Contract is paused" | Contract in emergency pause | Wait for unpause |
| "Offset out of bounds" | Pagination offset too large | Use valid offset value |

### Script Errors

| Error | Description | Resolution |
|-------|-------------|------------|
| "Example not found" | Unknown example name | Check available examples |
| "Category not found" | Unknown category name | Check available categories |
| "File not found" | Missing contract/test file | Ensure files exist in project |
| "Output directory exists" | Target path already exists | Remove or use different path |

## Type Definitions

### ExampleMetadata

```typescript
interface ExampleMetadata {
  name: string;           // Example identifier
  title: string;          // Display title
  description: string;    // Brief description
  concepts: string[];     // FHE concepts demonstrated
  contractFile: string;   // Path to contract
  testFile: string;       // Path to test file
  category: string;       // Category classification
}
```

### CategoryConfig

```typescript
interface CategoryConfig {
  name: string;           // Category identifier
  title: string;          // Display title
  description: string;    // Category description
  examples: string[];     // List of example names
}
```

---

**For more information, see the [Development Guide](../DEVELOPMENT.md) and [Testing Guide](testing-guide.md).**
