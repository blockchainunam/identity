from flask import Flask, jsonify, send_from_directory, request
from flask_restful import reqparse
import identity_model
import werkzeug
import requests
import json
import numpy as np

UPLOAD_FOLDER = ''
ALLOWED_EXTENSIONS = set([ 'png', 'jpg', 'jpeg', 'gif'])

app = Flask(__name__, static_url_path='')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def computeFeatureDistances(face1=None, face2=None):
    try:
        features1 = identity_model.getFaceFeaturesRepresentation(face1)
        features2 = identity_model.getFaceFeaturesRepresentation(face2)
        print("Comparing {} with {}.".format(face1, face2))

        diference = np.dot(features1, features2)
        print("Squared diference : {:0.3f}".format(diference))
        return diference
    except Exception as e:
        print(e)
        print("Error in the Comparation")
        return -1
    return -1


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/test")
def hello():
    return jsonify({"Everything is Awesome": "Everything is cool when you are part of a team"})


@app.route("/api", methods=['POST'])
def api():
    parse = reqparse.RequestParser()
    print("aaa")
    parse.add_argument('face_one', type=werkzeug.datastructures.FileStorage, location='files')
    parse.add_argument('face_two', type=werkzeug.datastructures.FileStorage, location='files')
    args = parse.parse_args()
    print("bbb")
    face_one = args['face_one']
    face_two = args['face_two']

    if not face_one or not face_two:
        return jsonify({"success": False, "error": "Invalid files"})

    print("Computing distance")
    distance = computeFeatureDistances(face_one,face_two )

    if distance == -1:
        return jsonify({"success": False, "error": "No face detected in Face Pictures"})

    elif distance > 1:
        return jsonify({"success": False, "error": "Diferent person"})

    elif distance > 1:
        return jsonify({"success": True, "error": "It is a Match"})


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=7777, debug=True)
