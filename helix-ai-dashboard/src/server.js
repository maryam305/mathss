import express from 'express';
import cors from 'cors';

/**
 * HELIX.AI SERVER CORE
 * Version: 2.5.0 (Production)
 * * This server acts as the central intelligence node, mocking 
 * complex bio-informatics computations and database interactions.
 */

const app = express();
const PORT = 3000;
const START_TIME = Date.now(); // Track server start time for uptime calculation

// --- MIDDLEWARE ---
app.use(cors()); // Allow cross-origin requests from the Frontend
app.use(express.json()); // Parse incoming JSON payloads

// Custom Request Logger
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
});

// --- DATA LAYER (SIMULATION) ---
// Simulates a persistent database state
const generateMockDatabase = () => {
    return {
        nodes: Array.from({ length: 45 }, (_, i) => ({
            id: `PRT-${(i + 100).toString(16).toUpperCase()}`,
            isOncogene: Math.random() > 0.85, // 15% chance of high-risk mutation
            type: Math.random() > 0.5 ? 'Kinase' : 'Transcription Factor',
            expression: Math.floor(Math.random() * 100),
            halfLife: Math.floor(Math.random() * 10) + 2
        })),
        productionMetrics: [
            { day: 'Mon', growth: 45, inhibition: 20, efficacy: 82 },
            { day: 'Tue', growth: 52, inhibition: 25, efficacy: 78 },
            { day: 'Wed', growth: 48, inhibition: 40, efficacy: 85 },
            { day: 'Thu', growth: 61, inhibition: 35, efficacy: 79 },
            { day: 'Fri', growth: 55, inhibition: 50, efficacy: 88 },
            { day: 'Sat', growth: 67, inhibition: 60, efficacy: 91 },
            { day: 'Sun', growth: 72, inhibition: 65, efficacy: 94 },
        ]
    };
};

// Initialize System State
let systemState = generateMockDatabase();

// --- API ENDPOINTS ---

/**
 * HEALTH CHECK
 * Used by the frontend 'Server Status' indicator.
 */
app.get('/api/status', (req, res) => {
    res.json({ 
        system: 'HELIX_AI_CORE', 
        status: 'ONLINE', 
        version: '2.5.0',
        uptime: Math.floor((Date.now() - START_TIME) / 1000),
        load: '14%' 
    });
});

/**
 * DASHBOARD ANALYTICS
 * Returns the main node network for the Holographic Graph.
 */
app.post('/api/analyze', (req, res) => {
    // Simulate complex spectral clustering calculation delay
    setTimeout(() => {
        res.json({
            network_data: { nodes: systemState.nodes },
            critical_pathways: [
                { source: systemState.nodes[0].id, target: systemState.nodes[1].id, risk: "HIGH" }
            ],
            spectral_metrics: {
                algebraic_connectivity: 0.042,
                eigen_gap: 0.15,
                modularity_index: 0.67
            }
        });
    }, 600);
});

/**
 * PRODUCTION METRICS
 * Returns time-series data for the Area Charts.
 */
app.get('/api/production-metrics', (req, res) => {
    res.json(systemState.productionMetrics);
});

/**
 * DATA INGESTION
 * Accepts new protein data points from the 'Add Data' form.
 * Includes validation logic.
 */
app.post('/api/data', (req, res) => {
    const { id, type, expression } = req.body;

    // 1. Validation Logic
    if (!id || !type || expression === undefined) {
        console.warn(" [!] Ingestion Failed: Missing required fields.");
        return res.status(400).json({ 
            error: "Invalid Payload", 
            message: "Fields 'id', 'type', and 'expression' are required." 
        });
    }

    console.log(` [>] Ingesting Data: ${id} (${type})`);

    // 2. Simulate Database Insert
    const newNode = {
        id,
        type,
        expression: parseInt(expression),
        isOncogene: Math.random() > 0.8, // Probabilistic classification
        halfLife: 5
    };
    
    // Unshift to add to the beginning of the list for visibility
    systemState.nodes.unshift(newNode);

    // 3. Success Response
    res.json({ 
        success: true,
        message: "Data Ingested Successfully", 
        node_id: id,
        classification_result: newNode.isOncogene ? 'ONCOGENE' : 'NEUTRAL',
        timestamp: new Date().toISOString() 
    });
});

// --- SERVER INIT ---
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════╗
    ║             HELIX.AI SERVER ONLINE               ║
    ║        Standard: REST API | Port: ${PORT}           ║
    ║        Access: http://localhost:${PORT}             ║
    ╚══════════════════════════════════════════════════╝
    `);
});