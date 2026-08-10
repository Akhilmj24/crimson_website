// @ts-nocheck
const validateInvoice = (data) => {
  if (!data) return { error: 'Request body is empty' };
  
  if (data.customerDetails && typeof data.customerDetails !== 'object') {
    return { error: 'customerDetails must be an object' };
  }

  if (data.sellerDetails && typeof data.sellerDetails !== 'object') {
    return { error: 'sellerDetails must be an object' };
  }

  if (data.items) {
    if (!Array.isArray(data.items)) {
      return { error: 'items must be an array' };
    }
    for (const item of data.items) {
      if (item.id === undefined || !item.description) {
        return { error: 'Each item must have a valid id and description' };
      }
    }
  }

  if (data.terms && !Array.isArray(data.terms)) {
    return { error: 'terms must be an array of strings' };
  }

  if (data.masterProducts && !Array.isArray(data.masterProducts)) {
    return { error: 'masterProducts must be an array' };
  }

  return { error: null };
};

export { 
  validateInvoice
 };
