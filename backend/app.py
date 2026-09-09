from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # the frontend dev server is a different origin


@app.get("/api/network")
def network():
    return jsonify(build_network())  # {"nodes": [...], "links": [...]}


if __name__ == "__main__":
    app.run(port=5001, debug=True)
