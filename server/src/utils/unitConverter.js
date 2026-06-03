/**
 * Converts a quantity and unit to its internal base unit and quantity.
 * Milligrams (mg) for weight, Milliliters (mL) for volume, Items (item) for counts.
 * 
 * @param {number} quantity - The input quantity
 * @param {string} unit - The input unit ('mg', 'g', 'kg', 'mL', 'L', 'item', 'strip', 'box')
 * @returns {object} { baseQuantity, baseUnit }
 */
export const convertToBase = (quantity, unit) => {
  const q = parseFloat(quantity);
  if (isNaN(q) || q <= 0) {
    throw new Error('Quantity must be a valid positive number');
  }

  switch (unit) {
    case 'kg':
      return { baseQuantity: q * 1000000, baseUnit: 'mg' };
    case 'g':
      return { baseQuantity: q * 1000, baseUnit: 'mg' };
    case 'mg':
      return { baseQuantity: q, baseUnit: 'mg' };
    case 'L':
      return { baseQuantity: q * 1000, baseUnit: 'mL' };
    case 'mL':
      return { baseQuantity: q, baseUnit: 'mL' };
    case 'box':
      return { baseQuantity: q * 100, baseUnit: 'item' };
    case 'strip':
      return { baseQuantity: q * 10, baseUnit: 'item' };
    case 'item':
      return { baseQuantity: q, baseUnit: 'item' };
    default:
      throw new Error(`Invalid unit: ${unit}. Supported units are: mg, g, kg, mL, L, item, strip, box`);
  }
};

/**
 * Validates if an input unit is compatible with the product's base unit.
 * 
 * @param {string} inputUnit - Unit requested
 * @param {string} baseUnit - Product's base unit
 * @returns {boolean}
 */
export const isUnitCompatible = (inputUnit, baseUnit) => {
  const weightUnits = ['mg', 'g', 'kg'];
  const volumeUnits = ['mL', 'L'];
  const countUnits = ['item', 'strip', 'box'];

  if (weightUnits.includes(baseUnit)) {
    return weightUnits.includes(inputUnit);
  }
  if (volumeUnits.includes(baseUnit)) {
    return volumeUnits.includes(inputUnit);
  }
  if (countUnits.includes(baseUnit)) {
    return countUnits.includes(inputUnit);
  }
  return false;
};

/**
 * Calculates pricing for a product given an input quantity and unit.
 * 
 * @param {number} quantity - Input quantity
 * @param {string} unit - Input unit
 * @param {number} basePrice - Product base unit price
 * @returns {object} { baseQuantity, pricePerUnit, subtotal }
 */
export const calculatePricing = (quantity, unit, basePrice) => {
  const { baseQuantity } = convertToBase(quantity, unit);
  
  let conversionFactor = 1;
  switch (unit) {
    case 'kg':
      conversionFactor = 1000000;
      break;
    case 'g':
      conversionFactor = 1000;
      break;
    case 'mg':
      conversionFactor = 1;
      break;
    case 'L':
      conversionFactor = 1000;
      break;
    case 'mL':
      conversionFactor = 1;
      break;
    case 'box':
      conversionFactor = 100;
      break;
    case 'strip':
      conversionFactor = 10;
      break;
    case 'item':
      conversionFactor = 1;
      break;
  }

  const pricePerUnit = basePrice * conversionFactor;
  const subtotal = Math.round(baseQuantity * basePrice * 100) / 100;

  return {
    baseQuantity,
    pricePerUnit: Math.round(pricePerUnit * 10000) / 10000, // round to 4 decimals for precision
    subtotal: Math.round(subtotal * 100) / 100,
  };
};

