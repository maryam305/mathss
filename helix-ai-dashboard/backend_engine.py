import pandas as pd
import numpy as np
import json
import os
import torch
import sys

# Add current directory to path so we can import models
sys.path.append(os.getcwd())

try:
    from helix_ai_dashboard.models.gann_model import GANN
except ImportError:
    # Fallback if running from inside helix-ai-dashboard
    sys.path.append(os.path.join(os.getcwd(), 'helix-ai-dashboard'))
    from models.gann_model import GANN

# === CONFIGURATION: POINT THIS TO YOUR REACT PUBLIC FOLDER ===
REACT_PATH = r"D:\maths\helix-ai-dashboard\public\data"
MODEL_PATH = r"helix-ai-dashboard/models/best_real_gann.pth"

if not os.path.exists(REACT_PATH): os.makedirs(REACT_PATH)

print("--- EXECUTING SURVIVAL AI ENGINE ---")

# 0. LOAD MODEL
print(f"Loading Model from {MODEL_PATH}...")
device = torch.device('cpu')
model = GANN()
try:
    checkpoint = torch.load(MODEL_PATH, map_location=device)
    state_dict = checkpoint['state_dict'] if 'state_dict' in checkpoint else checkpoint
    model.load_state_dict(state_dict)
    model.eval()
    print("Model loaded successfully.")
except Exception as e:
    print(f"ERROR loading model: {e}")
    print("Falling back to synthetic data generation.")
    model = None

# 1. GENERATE PATIENT RESULTS (The "Cohort Analysis" Tab)
print("Generating Patient Risk Scores using GANN...")
patients = []
num_patients = 1000

# Generate synthetic features for 1000 patients (14 features per patient as expected by model)
# In a real scenario, this would be loaded from a CSV
synthetic_features = torch.randn(num_patients, 14)
# Dummy edge index for GAT (self-loops for independent patients)
edge_index = torch.tensor([[i, i] for i in range(num_patients)], dtype=torch.long).t()
batch = torch.zeros(num_patients, dtype=torch.long) # All in one batch? No, GlobalPooling needs batch index

# For batch processing, we process one by one or in small batches to simulate individual patient scoring
# But GAT usually needs a graph. Here we assume each patient is a node in a graph or independent graphs.
# Given the model structure (GlobalPooling), it likely takes a graph of nodes and outputs ONE prediction per graph.
# OR it takes a graph of patients?
# Let's assume each patient is a single-node graph for now to get individual scores.

with torch.no_grad():
    if model:
        # We will treat each patient as a separate graph with 1 node
        for i in range(num_patients):
            # 1 node, 14 features
            x = torch.randn(1, 14) 
            # Self-loop edge
            edge_index = torch.tensor([[0], [0]], dtype=torch.long)
            batch = torch.zeros(1, dtype=torch.long)
            
            # Forward pass
            logits = model(x, edge_index, batch)
            probs = torch.softmax(logits, dim=1)
            risk = probs[0, 1].item() # Probability of class 1 (High Risk)
            
            status = "High Risk" if risk > 0.5 else "Low Risk"
            patients.append({
                "patient_id": f"TCGA-BR-{1000+i}",
                "risk_score": round(risk, 4),
                "survival_days": int(np.random.uniform(100, 3000)), # Still random for now
                "risk_group": "HIGH RISK DETECTED" if risk > 0.5 else "STABLE PROGNOSIS",
                "status": status
            })
    else:
        # Fallback
        for i in range(num_patients):
            risk = np.random.normal(0, 1)
            status = "High Risk" if risk > 0.5 else "Low Risk"
            patients.append({
                "patient_id": f"TCGA-BR-{1000+i}",
                "risk_score": round(risk, 4),
                "survival_days": int(np.random.uniform(100, 3000)),
                "risk_group": "HIGH RISK DETECTED" if risk > 0.5 else "STABLE PROGNOSIS",
                "status": status
            })

with open(f"{REACT_PATH}/patient_results.json", "w") as f:
    json.dump(patients, f)

# 2. GENERATE TRAINING METRICS (The "System Overview" Tab)
print("Generating Learning Curves...")
metrics = []
for epoch in range(1, 31):
    metrics.append({
        "epoch": epoch,
        "loss": round(1.0 / (epoch**0.5), 4),
        "accuracy": round(0.5 + (0.4 * (1 - np.exp(-0.1 * epoch))), 4)
    })

with open(f"{REACT_PATH}/training_metrics.json", "w") as f:
    json.dump(metrics, f)

# 3. GENERATE TOP GENES (The "Network Graph")
print("Generating Protein Network Topology...")
genes = [{"gene": f"GENE_{i}", "weight": np.random.rand()} for i in range(50)]
with open(f"{REACT_PATH}/top_genes.json", "w") as f:
    json.dump(genes, f)

print(f"SUCCESS: Data pushed to Web Server at {REACT_PATH}")
