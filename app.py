import os
import uuid
import mysql.connector
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Setup paths for PythonAnywhere
project_folder = os.path.expanduser('~/Lost_And_Found')
load_dotenv(os.path.join(project_folder, '.env'))

# Local Storage Configuration
UPLOAD_FOLDER = os.path.join(project_folder, 'static/uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db_config = {
    'host': 'mallika2002.mysql.pythonanywhere-services.com',
    'user': 'mallika2002',
    'password': os.getenv("DB_PASSWORD"),
    'database': 'mallika2002$lost_and_found',
    'port': 3306
}

def get_db_connection():
    try:
        return mysql.connector.connect(**db_config)
    except Exception:
        return None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/reports', methods=['GET'])
def get_reports():
    conn = get_db_connection()
    if not conn: return jsonify([]), 500
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM report ORDER BY reportdate DESC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    formatted = []
    for r in rows:
        formatted.append({
            'id': r['reportid'],
            'name': r['itemname'],
            'description': r['description'],
            'location': r['location'],
            'status': 'found' if r['isFound'] == 1 else 'lost',
            'contact': r['contact'],
            'imgurl': r['imgurl'],
            'date': r['reportdate'].strftime('%Y-%m-%d %H:%M') if r['reportdate'] else ""
        })
    return jsonify(formatted)

@app.route('/api/report', methods=['POST'])
def report_item():
    # Safely extract text data
    item_name = request.form.get('itemname')
    description = request.form.get('description')
    location = request.form.get('location')
    is_found = request.form.get('isFound')
    contact = request.form.get('contact')
    
    image_url = None


    if 'image' in request.files:
        image_file = request.files['image']
        if image_file and image_file.filename != '':
            unique_filename = f"{uuid.uuid4().hex}_{secure_filename(image_file.filename)}"
            image_file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
            image_url = f"/static/uploads/{unique_filename}"

    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO report 
            (itemname, description, location, isFound, contact, imgurl, reportdate) 
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        values = (item_name, description, location, is_found, contact, image_url)
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Success'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/report/<int:report_id>', methods=['DELETE'])
def delete_report(report_id):
    conn = get_db_connection()
    if not conn: return jsonify({'error': 'DB connection failed'}), 500
    cursor = conn.cursor()
    cursor.execute("DELETE FROM report WHERE reportid = %s", (report_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)