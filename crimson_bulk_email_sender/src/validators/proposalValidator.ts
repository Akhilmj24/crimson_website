// @ts-nocheck
const validateProposal = (data) => {
  if (!data) return { error: 'Request body is empty' };

  if (data.sender && typeof data.sender !== 'object') {
    return { error: 'sender must be an object' };
  }

  if (data.recipient && typeof data.recipient !== 'object') {
    return { error: 'recipient must be an object' };
  }

  if (data.sections) {
    if (!Array.isArray(data.sections)) {
      return { error: 'sections must be an array' };
    }
    for (const sec of data.sections) {
      if (sec.title === undefined || sec.content === undefined) {
        return { error: 'Each section must contain a title and content string' };
      }
    }
  }

  return { error: null };
};

export { 
  validateProposal
 };
