import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import mysql.connector
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv as load

app = Flask(__name__)
CORS(app)

load.env()

# Configuration       
cloudinary.config( 
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
    api_key = os.getenv("CLOUDINARY_API_KEY"), 
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv("DB_PASSWORD"), 
    'database': 'laf',
    'port': 3307
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return None

def insert_report(data, image_url):
    connection = get_db_connection()
    if connection is None:
        return False
    cursor = connection.cursor()

    query = '''
        INSERT INTO report (
        itemname, description, location, isFound, contact, imgurl, reportdate
    )
    VALUES (%s, %s, %s, %s, %s, %s, NOW())
    '''
    values = (data['itemname'], data['description'], data['location'], data['isFound'], data['contact'], image_url)
    try:
        cursor.execute(query, values)
        connection.commit()
        print("Report inserted successfully. Last inserted ID:", cursor.lastrowid)
        return True
    except mysql.connector.Error as err:
        print(f"Error inserting report: {err}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()


@app.route('/api/report', methods=['POST'])
def report_item():
    image_file = request.files.get('image')
    report_data = request.form
    is_found_str = report_data.get('isFound', '0')
    try:
        is_found_int = int(is_found_str)
    except ValueError:
        is_found_int = 0
    print(f"DEBUG: isFound value received: {is_found_str}, converted to: {is_found_int}")
    db_data = {
        'itemname': report_data.get('itemname'),
        'description': report_data.get('description'),
        'location': report_data.get('location'),
        'isFound': is_found_int,
        'contact': report_data.get('contact')
    }
    
    image_url = None

    if image_file and image_file.filename != '':
        try:
            upload_result = cloudinary.uploader.upload(image_file)
            image_url = upload_result.get('secure_url')
        except Exception as e:
            print(f"Error uploading image to Cloudinary: {e}")
            return jsonify({'message': 'Image upload failed'}), 500

    if not all([db_data['itemname'], db_data['description']]):
        return jsonify({'message': 'Missing required fields (Item Name, Description).'}), 400

    if insert_report(db_data, image_url):
        return jsonify({
            'message': 'Report submitted successfully!', 
            'imgUrl': image_url
        }), 201
    else:
        return jsonify({'message': 'Failed to save report to database.'}), 500
    
def extract_public_id(url):
    if not url:
        return None
    path_index = url.find('/upload/')
    if path_index == -1:
        return None
    path = url[path_index + len('/upload/'):]
    
    version_index = path.find('v')
    if version_index != -1:
        slash_after_version = path.find('/', version_index)
        if slash_after_version != -1:
            public_id_with_ext = path[slash_after_version + 1:]
            
            return public_id_with_ext.split('.')[0]
    return None

@app.route('/api/report/<int:report_id>', methods=['DELETE'])
def delete_item(report_id):
    
    connection = get_db_connection()
    if connection is None:
        return jsonify({'message': 'DB connection failed.'}), 500
        
    cursor = connection.cursor()
    fetch_query = "SELECT imgurl FROM report WHERE reportid = %s"
    cursor.execute(fetch_query, (report_id,))
    result = cursor.fetchone()

    if not result:
        cursor.close()
        connection.close()
        return jsonify({'message': 'Report ID {report_id} not found.'}), 404
    image_url = result[0]
    if image_url:
        public_id = extract_public_id(image_url)
        if public_id:
            try:
                cloudinary.uploader.destroy(public_id)
            except Exception as e:
                print(f"Error deleting image from Cloudinary for {public_id}: {e}")
    
    delete_query = "DELETE FROM report WHERE reportid = %s"

    try:
        cursor.execute(delete_query, (report_id,))
        connection.commit()
        return jsonify({'message': f'Report ID {report_id} deleted successfully.'}), 200    
    except mysql.connector.Error as err:
        print(f"Error deleting report ID {report_id}: {err}")
        connection.rollback()
        return jsonify({'message': 'Failed to delete report from database.'}), 500
    finally:
        cursor.close()
        connection.close()


def get_all_reports():
    """Retrieves all reports from the database."""
    connection = get_db_connection()
    if connection is None:
        return []
    
    # dictionary=True makes results easy to convert to JSON
    cursor = connection.cursor(dictionary=True) 
    
    query = "SELECT * FROM report ORDER BY reportdate DESC"
    
    try:
        cursor.execute(query)
        reports = cursor.fetchall()
        return reports
    except mysql.connector.Error as err:
        print(f"Failed to fetch reports: {err}")
        return []
    finally:
        cursor.close()
        connection.close()

@app.route('/api/reports', methods=['GET'])
def get_reports():
    """Handles GET request to fetch and return all reports as JSON."""
    
    reports = get_all_reports()
    
    # Format data for the frontend (converts tinyint(1) to status string)
    formatted_reports = []
    for report in reports:

        formatted_reports.append({
            'id': report['reportid'],
            'name': report['itemname'],
            'description': report['description'],
            'location': report['location'],
            'status': 'found' if report['isFound'] == 1 else 'lost',
            'contact': report['contact'],
            'imgurl': report['imgurl'],
            'date': report['reportdate'].strftime('%Y-%m-%d %H:%M:%S') 
        })
        
    return jsonify(formatted_reports), 200



if __name__ == '__main__':
    app.run(debug=True)

''' given by cloudinary

# Upload an image
upload_result = cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
                                           public_id="shoes")
print(upload_result["secure_url"])

# Optimize delivery by resizing and applying auto-format and auto-quality
optimize_url, _ = cloudinary_url("shoes", fetch_format="auto", quality="auto")
print(optimize_url)

# Transform the image: auto-crop to square aspect_ratio
auto_crop_url, _ = cloudinary_url("shoes", width=500, height=500, crop="auto", gravity="auto")
print(auto_crop_url)

'''
