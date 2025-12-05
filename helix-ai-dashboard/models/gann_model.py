
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GATConv, GlobalAttention

class GANN(torch.nn.Module):
    def __init__(self, num_node_features=14, hidden_channels=32, num_classes=2):
        super(GANN, self).__init__()
        
        # Input Projection
        # input_proj.0.weight: [256, 14] -> Linear(14, 256)
        self.input_proj = nn.Sequential(
            nn.Linear(num_node_features, 256),
            nn.BatchNorm1d(256),
            nn.ReLU()
        )
        
        # GAT Layers
        # Layer 0: 256 -> 32*8 = 256
        self.gat_layers = nn.ModuleList()
        self.gat_layers.append(GATConv(256, 32, heads=8, concat=True))
        
        # Layer 1: 256 -> 16*8 = 128
        self.gat_layers.append(GATConv(256, 16, heads=8, concat=True))
        
        # Layer 2: 128 -> 8*8 = 64
        self.gat_layers.append(GATConv(128, 8, heads=8, concat=True))
        
        # Batch Norms for GAT layers
        self.batch_norms = nn.ModuleList()
        self.batch_norms.append(nn.BatchNorm1d(256))
        self.batch_norms.append(nn.BatchNorm1d(128))
        self.batch_norms.append(nn.BatchNorm1d(64))
        
        # Global Pooling
        # global_pool.gate_nn.0.weight: [32, 64]
        gate_nn = nn.Sequential(
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )
        self.global_pool = GlobalAttention(gate_nn=gate_nn)
        
        # Classifier
        # classifier.0.weight: [32, 64]
        # classifier.4.weight: [16, 32]
        # classifier.8.weight: [2, 16]
        self.classifier = nn.Sequential(
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.5), # Assuming dropout based on gap in indices
            nn.Linear(32, 16),
            nn.BatchNorm1d(16),
            nn.ReLU(),
            nn.Dropout(0.5), # Assuming dropout
            nn.Linear(16, num_classes)
        )

    def forward(self, x, edge_index, batch):
        # Input Projection
        x = self.input_proj(x)
        
        # GAT Layers
        for i, gat in enumerate(self.gat_layers):
            x = gat(x, edge_index)
            x = self.batch_norms[i](x)
            x = F.relu(x)
            
        # Global Pooling
        x = self.global_pool(x, batch)
        
        # Classifier
        x = self.classifier(x)
        
        return x
