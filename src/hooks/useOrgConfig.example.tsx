/**
 * useOrgConfig Hook - Usage Examples
 * 
 * This file demonstrates how to use the useOrgConfig hook in various scenarios.
 * This is for reference only and not imported anywhere.
 */

import { useOrgConfig } from './useOrgConfig';

// ============================================
// Example 1: Basic Usage
// ============================================
function BasicExample() {
  const { config, loading, error } = useOrgConfig();

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!config) {
    return <div>No configuration available</div>;
  }

  return (
    <div>
      <h2>Organization Configuration</h2>
      <p>Tax Mode: {config.pricing.taxMode}</p>
      <p>Manufacturing Enabled: {config.modules.manufacturing.enabled ? 'Yes' : 'No'}</p>
    </div>
  );
}

// ============================================
// Example 2: Conditional Rendering
// ============================================
function ConditionalRenderingExample() {
  const { config, loading } = useOrgConfig();

  if (loading || !config) {
    return <div>Loading...</div>;
  }

  return (
    <nav>
      {config.modules.sales.enabled && <a href="/sales">Sales</a>}
      {config.modules.purchase.enabled && <a href="/purchase">Purchase</a>}
      {config.modules.stock.enabled && <a href="/stock">Stock</a>}
      {config.modules.manufacturing.enabled && <a href="/manufacturing">Manufacturing</a>}
      {config.modules.accounting.enabled && <a href="/accounting">Accounting</a>}
    </nav>
  );
}

// ============================================
// Example 3: Form Fields Based on Config
// ============================================
function FormFieldsExample() {
  const { config, loading } = useOrgConfig();

  if (loading || !config) {
    return <div>Loading...</div>;
  }

  return (
    <form>
      <h2>Item Details</h2>

      {/* Pricing Fields */}
      {config.pricing.allowGrossWeight && (
        <div>
          <label>Gross Weight (grams)</label>
          <input type="number" name="grossWeight" />
        </div>
      )}

      {config.pricing.allowNetWeight && (
        <div>
          <label>Net Weight (grams)</label>
          <input type="number" name="netWeight" />
        </div>
      )}

      {config.pricing.allowStonePrice && (
        <div>
          <label>Stone Price</label>
          <input type="number" name="stonePrice" />
        </div>
      )}

      {config.pricing.allowMakingCharges && (
        <div>
          <label>Making Charges</label>
          <input type="number" name="makingCharges" />
        </div>
      )}

      {/* Item Fields */}
      {config.itemFields.showPurity && (
        <div>
          <label>Purity</label>
          <select name="purity">
            <option value="22K">22K</option>
            <option value="18K">18K</option>
            <option value="14K">14K</option>
          </select>
        </div>
      )}

      {config.itemFields.showHallmark && (
        <div>
          <label>Hallmark Number</label>
          <input type="text" name="hallmark" />
        </div>
      )}

      {config.itemFields.showCertificate && (
        <div>
          <label>Certificate Number</label>
          <input type="text" name="certificate" />
        </div>
      )}

      {config.itemFields.showStoneDetails && (
        <div>
          <label>Stone Details</label>
          <textarea name="stoneDetails" />
        </div>
      )}
    </form>
  );
}

// ============================================
// Example 4: Workflow Indicators
// ============================================
function WorkflowExample() {
  const { config, loading } = useOrgConfig();

  if (loading || !config) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Create Purchase Order</h2>

      {config.workflows.requireApprovalForPurchase && (
        <div className="alert alert-info">
          This purchase order will require approval before processing.
        </div>
      )}

      {/* Form fields */}
      <form>
        {/* ... */}
      </form>
    </div>
  );
}

// ============================================
// Example 5: Tax Display
// ============================================
function TaxDisplayExample({ basePrice }: { basePrice: number }) {
  const { config, loading } = useOrgConfig();

  if (loading || !config) {
    return <div>Loading...</div>;
  }

  const taxRate = 0.03; // 3%
  const taxAmount = basePrice * taxRate;
  const finalPrice =
    config.pricing.taxMode === 'exclude'
      ? basePrice + taxAmount
      : basePrice;

  return (
    <div>
      <div>Base Price: ₹{basePrice.toFixed(2)}</div>

      {config.pricing.taxMode === 'exclude' ? (
        <>
          <div>Tax (3%): ₹{taxAmount.toFixed(2)}</div>
          <div>
            <strong>Total: ₹{finalPrice.toFixed(2)}</strong>
          </div>
        </>
      ) : (
        <>
          <div>
            <strong>Total (inclusive of tax): ₹{finalPrice.toFixed(2)}</strong>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'gray' }}>
            (includes tax of ₹{(basePrice * taxRate) / (1 + taxRate)).toFixed(2)})
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Example 6: Helper Functions
// ============================================
function HelperFunctionsExample() {
  const { config, loading } = useOrgConfig();

  if (loading || !config) {
    return null;
  }

  // Helper function to check if module is enabled
  const isModuleEnabled = (moduleName: keyof typeof config.modules) => {
    return config.modules[moduleName]?.enabled || false;
  };

  // Helper function to check feature
  const isFeatureEnabled = (path: string) => {
    const keys = path.split('.');
    let value: any = config;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return false;
    }

    return Boolean(value);
  };

  return (
    <div>
      {isModuleEnabled('manufacturing') && <div>Manufacturing is enabled</div>}
      {isFeatureEnabled('pricing.allowGrossWeight') && (
        <div>Gross weight pricing is allowed</div>
      )}
      {isFeatureEnabled('workflows.requireApprovalForPurchase') && (
        <div>Purchase approval is required</div>
      )}
    </div>
  );
}

// ============================================
// Example 7: Multiple Components Using Same Cache
// ============================================
// The hook uses global caching, so multiple components
// can use it without causing duplicate API calls

function ComponentA() {
  const { config } = useOrgConfig();
  // This will use cached data if ComponentB already fetched it
  return <div>Component A: {config?.pricing.taxMode}</div>;
}

function ComponentB() {
  const { config } = useOrgConfig();
  // This will use cached data if ComponentA already fetched it
  return <div>Component B: {config?.modules.manufacturing.enabled}</div>;
}

function ParentComponent() {
  // Both components share the same cache
  // Only one API call will be made
  return (
    <div>
      <ComponentA />
      <ComponentB />
    </div>
  );
}

