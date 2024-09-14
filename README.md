# Foodie - Backend

The backend for the Foodie app is built using **Node.js** and **Express**, and handles API requests for searching and filtering food, managing orders, and processing payments. **MongoDB** is used as the primary database, and **Cloudinary** is used for managing image uploads.

## Features

- API to search food by city.
- Filtering based on food type, delivery time, and price.
- Image upload functionality using **Cloudinary**.
- Secure payment processing with **Stripe**.
- Authentication and authorization handled through **Auth0**.
- Data stored in **MongoDB Atlas**.

## Tech Stack

- **Node.js** - Backend runtime environment.
- **Express** - Web framework for building the API.
- **MongoDB Atlas** - Cloud-hosted NoSQL database.
- **Cloudinary** - Image and media management platform.
- **Stripe** - Payment processing API.
- **Auth0** - Authentication and authorization provider.

## Project Setup

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB Atlas account
- Cloudinary account for image uploads
- Stripe account for payment processing
- Auth0 account for authentication

## Installation

### 1. Clone the repository:

```bash
git clone https://github.com/yourusername/foodie-backend.git
```
### 2. Navigate to the project directory:
```bash
cd foodie-be
```

### 3. Install dependencies:
```bash
npm install
```

### 4. Set up environment variables by creating a `.env` file in the root of the project:
```bash
AUTH0_AUDIENCE=
AUTH0_ISSUER_BASEURL=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=
FRONTEND_URL=
MONGODB_CONNECTION_STRING=
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Run Development using nodemon
