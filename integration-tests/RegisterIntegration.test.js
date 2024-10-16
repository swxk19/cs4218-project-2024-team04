import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import users from '../test-db-utils/sample-data/sampleUsers.js'; // Import sample users data

dotenv.config({ path: '.env.test' });

describe('insert', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_TEST_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    db = connection.db();

    // Clear the users collection and populate it with sample data before tests
    await db.collection('users').deleteMany({});
    await db.collection('users').insertMany(users);
  });

  afterAll(async () => {
    // Clear the users collection after all tests are done
    await db.collection('users').deleteMany({});
    await connection.close();
  });

  it('should insert a user into users', async () => {
    const usersCollection = db.collection('users');

    const mockUser = { _id: 'some-user-id', name: 'John' };
    await usersCollection.insertOne(mockUser);

    const insertedUser = await usersCollection.findOne({ _id: 'some-user-id' });
    expect(insertedUser).toEqual(mockUser);
  });

  it('should find all users in the database', async () => {
    const usersCollection = db.collection('users');

    const foundUsers = await usersCollection.find({}).toArray();
    expect(foundUsers.length).toBe(6); // 5 sample users + 1 inserted user
  });
});
