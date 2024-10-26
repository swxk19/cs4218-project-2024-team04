const orders = [
  {
    products: [], // To be filled with actual product IDs
    payment: {
      method: 'credit card',
      transactionId: 'txn_123456789',
      amount: 1019.98,
    },
    buyer: '', // To be filled with actual user ID
    status: 'Processing',
  },
  {
    products: [], // To be filled with actual product IDs
    payment: {
      method: 'paypal',
      transactionId: 'txn_987654321',
      amount: 1499.99,
    },
    buyer: '', // To be filled with actual user ID
    status: 'Shipped',
  },
  {
    products: [], // To be filled with actual product IDs
    payment: {
      method: 'credit card',
      transactionId: 'txn_987123456',
      amount: 49.99,
    },
    buyer: '', // To be filled with actual user ID
    status: 'deliverd', // Matches the model enum
  },
  {
    products: [], // To be filled with actual product IDs
    payment: {
      method: 'bank transfer',
      transactionId: 'txn_654321987',
      amount: 999.99,
    },
    buyer: '', // To be filled with actual user ID
    status: 'cancel', // Matches the model enum
  },
  {
    products: [], // To be filled with actual product IDs
    payment: {
      method: 'credit card',
      transactionId: 'txn_321654987',
      amount: 19.99,
    },
    buyer: '', // To be filled with actual user ID
    status: 'Not Process', // Matches the model enum
  },
];

export default orders;
