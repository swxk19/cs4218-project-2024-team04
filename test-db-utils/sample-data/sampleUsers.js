import { hashPassword } from '../../helpers/authHelper.js'

/**
 * Generates sample user data with hashed passwords and returns credentials
 * @returns {Promise<[any[], Record<string, string>]>} Array of users and object with credentials
 */
export async function getSampleUsers() {
    const passwordMap = {
        'admin@admin.com': 'admin',
        'john@example.com': 'hashedpassword123',
        'jane@example.com': 'hashedpassword456',
        'alice@example.com': 'hashedpassword789',
        'bob@example.com': 'hashedpassword321',
        'charlie@example.com': 'hashedpassword654',
    }

    const users = [
        {
            name: 'Admin User',
            email: 'admin@admin.com',
            password: await hashPassword(passwordMap['admin@admin.com']),
            phone: '1112223333',
            address: '101 Admin St, Admin City, Admin State, 11111, Admin Country',
            answer: 'admin',
            role: 1,
        },
        {
            name: 'John Doe',
            email: 'john@example.com',
            password: await hashPassword(passwordMap['john@example.com']),
            phone: '1234567890',
            address: '123 Main St, Sample City, Sample State, 12345, Sample Country',
            answer: 'blue',
            role: 0,
        },
        {
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: await hashPassword(passwordMap['jane@example.com']),
            phone: '0987654321',
            address: '456 Oak Ave, Another City, Another State, 67890, Another Country',
            answer: 'green',
            role: 0,
        },
        {
            name: 'Alice Johnson',
            email: 'alice@example.com',
            password: await hashPassword(passwordMap['alice@example.com']),
            phone: '9876543210',
            address: '789 Pine St, Third City, Third State, 54321, Third Country',
            answer: 'red',
            role: 1,
        },
        {
            name: 'Bob Williams',
            email: 'bob@example.com',
            password: await hashPassword(passwordMap['bob@example.com']),
            phone: '8765432109',
            address: '321 Birch Blvd, Fourth City, Fourth State, 98765, Fourth Country',
            answer: 'yellow',
            role: 0,
        },
        {
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            password: await hashPassword(passwordMap['charlie@example.com']),
            phone: '7654321098',
            address: '654 Cedar St, Fifth City, Fifth State, 87654, Fifth Country',
            answer: 'purple',
            role: 0,
        },
    ]

    return [users, passwordMap]
}
