// MongoDB initialization script
db = db.getSiblingDB('taskmanager');

// Create a user for the application
db.createUser({
  user: 'taskmanager_user',
  pwd: 'taskmanager_password',
  roles: [
    {
      role: 'readWrite',
      db: 'taskmanager'
    }
  ]
});

// Create collections and indexes
db.createCollection('users');
db.createCollection('tasks');

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "orgId": 1 });
db.users.createIndex({ "orgId": 1, "email": 1 });
db.users.createIndex({ "orgId": 1, "roles": 1 });
db.users.createIndex({ "email": 1, "isActive": 1 });

// Create indexes for tasks collection
db.tasks.createIndex({ "orgId": 1 });
db.tasks.createIndex({ "ownerId": 1 });
db.tasks.createIndex({ "orgId": 1, "status": 1 });
db.tasks.createIndex({ "orgId": 1, "ownerId": 1 });
db.tasks.createIndex({ "orgId": 1, "dueDate": 1 });
db.tasks.createIndex({ "orgId": 1, "priority": 1 });
db.tasks.createIndex({ "orgId": 1, "isOverdue": 1 });
db.tasks.createIndex({ "orgId": 1, "tags": 1 });
db.tasks.createIndex({ "title": "text", "tags": "text" });
db.tasks.createIndex({ "dueDate": 1, "status": 1, "isOverdue": 1 });

print('Database and collections initialized successfully!'); 