# Recipe Manager

A simple web application for managing and displaying recipes with ingredient information.

## Prerequisites
- Node.js (v14+)
- MySQL (v8.0+)

## Setup

1. **Clone the repository**

2. **Install dependencies**

```bash
   npm install
```

3. **Database setup**

```bash
   # Create the database
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS recipe_db;"
   
   # Import schema and seed data
   mysql -u root -p recipe_db < recipe_db_dump.sql
```

4. **Configure environment**
   Create a `.env` file in the project root:

```javascript
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASS=your_password
   DB_NAME=recipe_db
   PORT=3000
```

5. **Start the application**

```bash
   node app.js
```

   You should see: "Server running on http://localhost:3000"

6. **Access the application**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)


## Project Structure

- `views/`: EJS templates for rendering pages
- `routes/`: Express route handlers
- `public/`: Static assets (CSS, client-side JS)
- `app.js`: Application entry point
- `database.js`: Database connection configuration
