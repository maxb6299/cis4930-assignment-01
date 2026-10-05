# Some code in this file was generated using AI

from flask import Flask, jsonify
from flask_cors import CORS

import os
import pandas as pd

app = Flask(__name__)
CORS(app)  # the frontend dev server is a different origin

DATA_PATH = os.path.join(
    os.path.dirname(__file__), "data/paper_citation_links_within_fsu.csv"
)


def build_network():
    df = pd.read_csv(DATA_PATH)

    # get nodes
    unique_ids = pd.concat([df["citing_paper_id"], df["cited_paper_id"]]).unique()
    nodes = [{"id": str(i), "group": 1} for i in unique_ids]

    # count duplicate edges and export directly to dict
    links = (
        df.value_counts(subset=["citing_paper_id", "cited_paper_id"])
        .reset_index(name="value")
        .rename(columns={"citing_paper_id": "source", "cited_paper_id": "target"})
        .to_dict("records")
    )

    return {
        "nodes": nodes,
        "links": links,
    }


@app.get("/api/network")
def network():
    try:
        network_data = build_network()
        return jsonify(network_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)
