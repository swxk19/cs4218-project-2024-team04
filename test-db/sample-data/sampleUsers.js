// sampleUsers.js
const users = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword123',
      phone: '1234567890',
      address: {
        street: '123 Main St',
        city: 'Sample City',
        state: 'Sample State',
        zip: '12345',
        country: 'Sample Country',
      },
      answer: 'blue',
      role: 0,
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'hashedpassword456',
      phone: '0987654321',
      address: {
        street: '456 Oak Ave',
        city: 'Another City',
        state: 'Another State',
        zip: '67890',
        country: 'Another Country',
      },
      answer: 'green',
      role: 0,
    },
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'hashedpassword789',
      phone: '9876543210',
      address: {
        street: '789 Pine St',
        city: 'Third City',
        state: 'Third State',
        zip: '54321',
        country: 'Third Country',
      },
      answer: 'red',
      role: 1, // Admin user
    },
    {
      name: 'Bob Williams',
      email: 'bob@example.com',
      password: 'hashedpassword321',
      phone: '8765432109',
      address: {
        street: '321 Birch Blvd',
        city: 'Fourth City',
        state: 'Fourth State',
        zip: '98765',
        country: 'Fourth Country',
      },
      answer: 'yellow',
      role: 0,
    },
    {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'hashedpassword654',
      phone: '7654321098',
      address: {
        street: '654 Cedar St',
        city: 'Fifth City',
        state: 'Fifth State',
        zip: '87654',
        country: 'Fifth Country',
      },
      answer: 'purple',
      role: 0,
    },
  ];

  module.exports = users;
