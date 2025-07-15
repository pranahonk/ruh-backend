# Wellness Platform API

## Overview

A comprehensive Node.js backend API wrapper for client and appointment management with PostgreSQL storage and periodic synchronization with an external API. This system provides a robust foundation for managing wellness appointments, client data, and ensures data consistency through automated synchronization processes.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Data Synchronization](#data-synchronization)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Features

- **RESTful API**: Comprehensive endpoints for managing clients and appointments
- **PostgreSQL Integration**: Robust data storage with proper schema design
- **API Key Authentication**: Secure access to all endpoints
- **Periodic Synchronization**: Automated sync with external API every 15 minutes
- **Comprehensive Error Handling**: Resilient operation with detailed error logging
- **Sync Logging**: Detailed logs of all sync operations for auditing and debugging
- **Idempotent Operations**: Safe retry mechanisms for API operations

## Project Structure

```
ruh-backend/
├── .env                    # Environment variables (not in version control)
├── .env.example           # Example environment variables template
├── package.json           # Project dependencies and scripts
├── README.md              # Project documentation
├── scripts/
│   ├── setup-db.js        # Database initialization script
│   └── test-api.js        # API testing script
└── src/
    ├── config/
    │   ├── db.js          # Database connection configuration
    │   └── init-db.js     # Database schema initialization
    ├── controllers/
    │   ├── appointmentController.js  # Appointment business logic
    │   └── clientController.js       # Client business logic
    ├── middleware/
    │   └── auth.js        # Authentication middleware
    ├── models/
    │   ├── appointment.js # Appointment data model
    │   └── client.js      # Client data model
    ├── routes/
    │   ├── appointmentRoutes.js  # Appointment API routes
    │   └── clientRoutes.js       # Client API routes
    ├── utils/
    │   └── syncService.js # Synchronization service
    └── index.js           # Application entry point
```

## Prerequisites

- **Node.js**: v14.0.0 or higher
- **PostgreSQL**: v12.0 or higher
- **npm**: v6.0.0 or higher

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ruh-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Initialize the database:

```bash
npm run setup-db
```

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=wellness_platform

# Server Configuration
PORT=3000

# API Configuration
API_KEY=your_api_key_here
```

## Running the Application

### Development Mode

Run the application with hot-reloading using nodemon:

```bash
npm run dev
```

### Production Mode

Start the application in production mode:

```bash
npm start
```

### Additional Scripts

- **Setup Database**: `npm run setup-db`
- **Test API**: `npm run test-api`

## API Documentation

### Base URL

```
http://localhost:3000
```

### Health Check

```
GET /health
```

Returns the current status of the API.

**Response**:

```json
{
  "status": "OK",
  "timestamp": "2025-07-15T02:05:15.936Z"
}
```

### Root Endpoint

```
GET /
```

Returns basic API information.

**Response**:

```json
{
  "message": "Wellness Platform API",
  "version": "1.0.0",
  "endpoints": {
    "clients": "/api/clients",
    "appointments": "/api/appointments"
  }
}
```

### Client Endpoints

#### Get All Clients

```
GET /api/clients
```

Returns a list of all clients.

**Headers**:

```
Authorization: Bearer YOUR_API_KEY
```

**Response**:

```json
[
  {
    "id": "f59038a5-65d2-43ec-9fcf-02fdbb9bf6a6",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "created_at": "2025-07-15T02:03:59.590Z",
    "updated_at": "2025-07-15T02:03:59.590Z",
    "synced": false
  },
  {
    "id": "17ba0f64-d4df-4e1e-a5d5-3e0ccfea2ac2",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543210",
    "created_at": "2025-07-15T02:03:59.597Z",
    "updated_at": "2025-07-15T02:03:59.597Z",
    "synced": false
  }
]
```

#### Get Client by ID

```
GET /api/clients/:id
```

Returns a specific client by ID.

**Headers**:

```
Authorization: Bearer YOUR_API_KEY
```

**Response**:

```json
{
  "id": "f59038a5-65d2-43ec-9fcf-02fdbb9bf6a6",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "created_at": "2025-07-15T02:03:59.590Z",
  "updated_at": "2025-07-15T02:03:59.590Z",
  "synced": false
}
```

#### Create Client

```
POST /api/clients
```

Creates a new client.

**Headers**:

```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Test Client",
  "email": "test@example.com",
  "phone": "5551234567"
}
```

**Response**:

```json
{
  "id": "25c25def-99e9-46c2-bf89-49e76a3dfe26",
  "name": "Test Client",
  "email": "test@example.com",
  "phone": "5551234567",
  "created_at": "2025-07-15T02:05:15.957Z",
  "updated_at": "2025-07-15T02:05:15.957Z",
  "synced": false
}
```

#### Update Client

```
PUT /api/clients/:id
```

Updates an existing client.

**Headers**:

```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Updated Client Name",
  "email": "updated@example.com",
  "phone": "5559876543"
}
```

**Response**:

```json
{
  "id": "25c25def-99e9-46c2-bf89-49e76a3dfe26",
  "name": "Updated Client Name",
  "email": "updated@example.com",
  "phone": "5559876543",
  "created_at": "2025-07-15T02:05:15.957Z",
  "updated_at": "2025-07-15T02:10:20.123Z",
  "synced": false
}
```

### Appointment Endpoints

#### Get All Appointments

```
GET /api/appointments
```

Returns a list of all appointments with client details.

**Headers**:

```
Authorization: Bearer YOUR_API_KEY
```

**Response**:

```json
[
  {
    "id": "ef9b7821-205b-47ba-a5f2-e0055161cc96",
    "client_id": "25c25def-99e9-46c2-bf89-49e76a3dfe26",
    "time": "2025-07-20T07:00:00.000Z",
    "created_at": "2025-07-15T02:05:15.963Z",
    "updated_at": "2025-07-15T02:05:15.963Z",
    "synced": false,
    "client_name": "Test Client",
    "client_email": "test@example.com"
  }
]
```

#### Get Appointment by ID

```
GET /api/appointments/:id
```

Returns a specific appointment by ID with client details.

**Headers**:

```
Authorization: Bearer YOUR_API_KEY
```

**Response**:

```json
{
  "id": "ef9b7821-205b-47ba-a5f2-e0055161cc96",
  "client_id": "25c25def-99e9-46c2-bf89-49e76a3dfe26",
  "time": "2025-07-20T07:00:00.000Z",
  "created_at": "2025-07-15T02:05:15.963Z",
  "updated_at": "2025-07-15T02:05:15.963Z",
  "synced": false,
  "client_name": "Test Client",
  "client_email": "test@example.com"
}
```

#### Create Appointment

```
POST /api/appointments
```

Creates a new appointment.

**Headers**:

```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body**:

```json
{
  "client_id": "25c25def-99e9-46c2-bf89-49e76a3dfe26",
  "time": "2025-07-20T14:00:00Z"
}
```

**Response**:

```json
{
  "id": "ef9b7821-205b-47ba-a5f2-e0055161cc96",
  "client_id": "25c25def-99e9-46c2-bf89-49e76a3dfe26",
  "time": "2025-07-20T14:00:00.000Z",
  "created_at": "2025-07-15T02:05:15.963Z",
  "updated_at": "2025-07-15T02:05:15.963Z",
  "synced": false,
  "client_name": "Test Client",
  "client_email": "test@example.com"
}
```

#### Update Appointment

```
PUT /api/appointments/:id
```

Updates an existing appointment.

**Headers**:

```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Request Body**:

```json
{
  "client_id": "25c25def-99e9-46c2-bf89-49e76a3dfe26",
  "time": "2025-07-21T15:30:00Z"
}
```

**Response**:

```json
{
  "id": "ef9b7821-205b-47ba-a5f2-e0055161cc96",
  "client_id": "25c25def-99e9-46c2-bf89-49e76a3dfe26",
  "time": "2025-07-21T15:30:00.000Z",
  "created_at": "2025-07-15T02:05:15.963Z",
  "updated_at": "2025-07-15T02:15:30.456Z",
  "synced": false,
  "client_name": "Test Client",
  "client_email": "test@example.com"
}
```

## Authentication

All API endpoints require API key authentication. The API key must be included in the request header as follows:

```
Authorization: Bearer YOUR_API_KEY
```

The API key is configured in the `.env` file. For development purposes, the default API key is `dev_api_key_12345`.

### Error Responses

- **401 Unauthorized**: API key is missing
- **403 Forbidden**: Invalid API key

## Data Synchronization

The application simulates periodic synchronization with an external API. This ensures that the local database stays in sync with the external system.

### Sync Process

1. **Initial Sync**: Occurs when the server starts
2. **Scheduled Sync**: Runs every 15 minutes (configurable)
3. **Sync Direction**: Bi-directional (pull from API and push local changes)

### Sync Components

- **SyncService**: Manages the synchronization process
- **MockApiClient**: Simulates external API calls
- **Sync Logs**: Records all sync operations for auditing

### Sync Error Handling

The sync process includes robust error handling:

- Individual record errors don't affect the entire batch
- Detailed logging of all sync operations
- Foreign key constraint validation
- Duplicate record handling

## Database Schema

### Clients Table

| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| id          | VARCHAR(50)  | Primary key                    |
| name        | VARCHAR(100) | Client name                    |
| email       | VARCHAR(100) | Client email (unique)          |
| phone       | VARCHAR(20)  | Client phone number            |
| created_at  | TIMESTAMP    | Record creation timestamp      |
| updated_at  | TIMESTAMP    | Record last update timestamp   |
| synced      | BOOLEAN      | Sync status flag               |

### Appointments Table

| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| id          | VARCHAR(50)  | Primary key                    |
| client_id   | VARCHAR(50)  | Foreign key to clients table   |
| time        | TIMESTAMP    | Appointment time               |
| created_at  | TIMESTAMP    | Record creation timestamp      |
| updated_at  | TIMESTAMP    | Record last update timestamp   |
| synced      | BOOLEAN      | Sync status flag               |

### Sync Logs Table

| Column      | Type         | Description                    |
|-------------|--------------|--------------------------------|
| id          | SERIAL       | Primary key                    |
| entity_type | VARCHAR(50)  | Type of entity (client/appointment) |
| operation   | VARCHAR(20)  | Operation type (pull/push)     |
| entity_id   | VARCHAR(50)  | ID of the entity               |
| sync_time   | TIMESTAMP    | Sync operation timestamp       |
| success     | BOOLEAN      | Success status                 |
| message     | TEXT         | Additional message/error       |

## Error Handling

The application implements comprehensive error handling:

### API Error Responses

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing authentication
- **403 Forbidden**: Invalid authentication
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate email)
- **500 Internal Server Error**: Server-side error

### Validation

- Input validation for all API endpoints
- Database constraint validation
- Foreign key relationship validation

## Testing

### API Testing

Use the included test script to verify API functionality:

```bash
npm run test-api
```

This script tests all API endpoints with sample data.

### Manual Testing with Postman

Import the provided Postman collection to test the API manually:

```json
{
  "info": {
    "name": "Virtual Wellness Platform Mock API",
    "_postman_id": "mock-health-api-id",
    "description": "Mock API for testing client and appointment management",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Clients",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer YOUR_API_KEY",
            "type": "text"
          }
        ],
        "url": {
          "raw": "https://mock.api/clients",
          "protocol": "https",
          "host": [
            "mock",
            "api"
          ],
          "path": [
            "clients"
          ]
        }
      }
    },
    {
      "name": "Get Appointments",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer YOUR_API_KEY",
            "type": "text"
          }
        ],
        "url": {
          "raw": "https://mock.api/appointments",
          "protocol": "https",
          "host": [
            "mock",
            "api"
          ],
          "path": [
            "appointments"
          ]
        }
      }
    },
    {
      "name": "Create Appointment",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer YOUR_API_KEY",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"client_id\": \"1\", \"time\": \"2025-07-15T09:00:00Z\"}"
        },
        "url": {
          "raw": "https://mock.api/appointments",
          "protocol": "https",
          "host": [
            "mock",
            "api"
          ],
          "path": [
            "appointments"
          ]
        }
      }
    }
  ]
}
```

## Deployment

### Prerequisites

- Node.js runtime environment
- PostgreSQL database server
- Environment variables configuration

### Production Deployment Steps

1. Clone the repository to your production server
2. Install dependencies: `npm install --production`
3. Configure environment variables for production
4. Set up the PostgreSQL database
5. Run the database setup script: `npm run setup-db`
6. Start the application: `npm start`

### Recommended Production Setup

- Use a process manager like PM2 to keep the application running
- Set up a reverse proxy with Nginx or Apache
- Configure SSL for secure API access
- Set up database backups

## Troubleshooting

### Common Issues

#### Database Connection Errors

- Verify PostgreSQL is running
- Check database credentials in `.env` file
- Ensure the database exists

#### Sync Errors

- Check for duplicate records
- Verify foreign key relationships
- Review sync logs for detailed error messages

#### API Key Authentication Failures

- Verify the API key in the request header
- Check the API key configuration in `.env` file

### Logs

The application logs important events to the console. In production, consider setting up a logging service to capture and analyze logs.

## License

ISC

---

© 2025 Wellness Platform API. All rights reserved.
