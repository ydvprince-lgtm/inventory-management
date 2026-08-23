from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# Database setup
def init_db():
    conn = sqlite3.connect('inventory.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS items 
                 (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price REAL, quantity INTEGER)''')
    conn.commit()
    conn.close()

# 1. Serve Frontend
@app.route('/')
def home():
    return render_template('index.html')

# 2. API: Get all items
@app.route('/api/items', methods=['GET'])
def get_items():
    conn = sqlite3.connect('inventory.db')
    c = conn.cursor()
    c.execute("SELECT * FROM items")
    items = [{'id': row[0], 'name': row[1], 'category': row[2], 'price': row[3], 'quantity': row[4]} for row in c.fetchall()]
    conn.close()
    return jsonify(items)

# 3. API: Add item
@app.route('/api/add', methods=['POST'])
def add_item():
    data = request.json
    conn = sqlite3.connect('inventory.db')
    c = conn.cursor()
    c.execute("INSERT INTO items (name, category, price, quantity) VALUES (?, ?, ?, ?)", 
              (data['name'], data['category'], data['price'], data['quantity']))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

# 4. API: Update item quantity
@app.route('/api/update/<int:id>', methods=['PUT'])
def update_item(id):
    data = request.json
    conn = sqlite3.connect('inventory.db')
    c = conn.cursor()
    c.execute("UPDATE items SET quantity = ? WHERE id = ?", (data['quantity'], id))
    conn.commit()
    conn.close()
    return jsonify({'status': 'updated'})

# 5. API: Delete item
@app.route('/api/delete/<int:id>', methods=['DELETE'])
def delete_item(id):
    conn = sqlite3.connect('inventory.db')
    c = conn.cursor()
    c.execute("DELETE FROM items WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'deleted'})

# Database initialize karo (Production ke liye zaroori)
with app.app_context():
    init_db()

if __name__ == '__main__':
    app.run(debug=True)
