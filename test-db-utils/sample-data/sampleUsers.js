import { hashPassword } from '../../helpers/authHelper.js';

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword123',
    phone: '1234567890',
    address: '123 Main St, Sample City, Sample State, 12345, Sample Country',
    answer: 'blue',
    role: 0,
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'hashedpassword456',
    phone: '0987654321',
    address: '456 Oak Ave, Another City, Another State, 67890, Another Country',
    answer: 'green',
    role: 0,
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'hashedpassword789',
    phone: '9876543210',
    address: '789 Pine St, Third City, Third State, 54321, Third Country',
    answer: 'red',
    role: 1,
  },
  {
    name: 'Bob Williams',
    email: 'bob@example.com',
    password: 'hashedpassword321',
    phone: '8765432109',
    address: '321 Birch Blvd, Fourth City, Fourth State, 98765, Fourth Country',
    answer: 'yellow',
    role: 0,
  },
  {
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    password: 'hashedpassword654',
    phone: '7654321098',
    address: '654 Cedar St, Fifth City, Fifth State, 87654, Fifth Country',
    answer: 'purple',
    role: 0,
  },
  {
    name: 'Admin User',
    email: 'admin@admin.com',
    password: 'admin',
    phone: '1112223333',
    address: '101 Admin St, Admin City, Admin State, 11111, Admin Country',
    answer: 'admin',
    role: 1,
  },
];

const hashUserPasswords = async (userList) => {
  return Promise.all(userList.map(async (user) => {
    const hashedPassword = await hashPassword(user.password);
    return {
      ...user,
      password: hashedPassword,
    };
  }));
};

export const getHashedUsers = async () => {
  return await hashUserPasswords(users);
};
