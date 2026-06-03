import { describe, it, expect } from 'vitest';
import { convertToBase, isUnitCompatible, calculatePricing } from '../src/utils/unitConverter.js';

describe('Medico Unit Conversion Utility Tests', () => {
  describe('convertToBase', () => {
    it('should correctly convert weight units to milligrams', () => {
      expect(convertToBase(1.5, 'kg')).toEqual({ baseQuantity: 1500000, baseUnit: 'mg' });
      expect(convertToBase(2, 'g')).toEqual({ baseQuantity: 2000, baseUnit: 'mg' });
      expect(convertToBase(500, 'mg')).toEqual({ baseQuantity: 500, baseUnit: 'mg' });
    });

    it('should correctly convert volume units to milliliters', () => {
      expect(convertToBase(2.5, 'L')).toEqual({ baseQuantity: 2500, baseUnit: 'mL' });
      expect(convertToBase(120, 'mL')).toEqual({ baseQuantity: 120, baseUnit: 'mL' });
    });

    it('should correctly convert count units to single items', () => {
      expect(convertToBase(2, 'box')).toEqual({ baseQuantity: 200, baseUnit: 'item' });
      expect(convertToBase(5, 'strip')).toEqual({ baseQuantity: 50, baseUnit: 'item' });
      expect(convertToBase(15, 'item')).toEqual({ baseQuantity: 15, baseUnit: 'item' });
    });

    it('should throw error for invalid quantities', () => {
      expect(() => convertToBase(-5, 'mg')).toThrow();
      expect(() => convertToBase('abc', 'strip')).toThrow();
    });

    it('should throw error for unsupported units', () => {
      expect(() => convertToBase(10, 'vials')).toThrow();
    });
  });

  describe('isUnitCompatible', () => {
    it('should confirm compatibility of matching dimensions', () => {
      expect(isUnitCompatible('kg', 'mg')).toBe(true);
      expect(isUnitCompatible('g', 'mg')).toBe(true);
      expect(isUnitCompatible('mg', 'mg')).toBe(true);
      
      expect(isUnitCompatible('L', 'mL')).toBe(true);
      expect(isUnitCompatible('mL', 'mL')).toBe(true);
      
      expect(isUnitCompatible('box', 'item')).toBe(true);
      expect(isUnitCompatible('strip', 'item')).toBe(true);
      expect(isUnitCompatible('item', 'item')).toBe(true);
    });

    it('should deny compatibility across dimensions', () => {
      expect(isUnitCompatible('mg', 'mL')).toBe(false);
      expect(isUnitCompatible('L', 'item')).toBe(false);
      expect(isUnitCompatible('box', 'mg')).toBe(false);
    });
  });

  describe('calculatePricing', () => {
    it('should calculate pricing per base unit for weight conversions (mg/g/kg)', () => {
      // Amoxicillin: base price ₹0.012 per mg. Ordered: 2 g.
      // Expected base quantity = 2000 mg
      // Price per ordered unit (g) = 0.012 * 1000 = ₹12.00
      // Subtotal = 2000 * 0.012 = ₹24.00
      const pricing = calculatePricing(2, 'g', 0.012);
      expect(pricing.baseQuantity).toBe(2000);
      expect(pricing.pricePerUnit).toBe(12);
      expect(pricing.subtotal).toBe(24);
    });

    it('should calculate pricing correctly for count conversions (item/strip/box)', () => {
      // Vitamin C: base price ₹1.50 per tablet (item). Ordered: 5 strips.
      // Expected base quantity = 5 * 10 = 50 tablets (items)
      // Price per ordered unit (strip) = 1.50 * 10 = ₹15.00
      // Subtotal = 50 * 1.50 = ₹75.00
      const pricing = calculatePricing(5, 'strip', 1.50);
      expect(pricing.baseQuantity).toBe(50);
      expect(pricing.pricePerUnit).toBe(15);
      expect(pricing.subtotal).toBe(75);
    });

    it('should calculate pricing correctly for volume conversions (mL/L)', () => {
      // Insulin: base price ₹40.00 per mL. Ordered: 5 mL.
      const pricing = calculatePricing(5, 'mL', 40);
      expect(pricing.baseQuantity).toBe(5);
      expect(pricing.pricePerUnit).toBe(40);
      expect(pricing.subtotal).toBe(200);
    });
  });
});
