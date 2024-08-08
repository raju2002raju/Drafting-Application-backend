const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

router.post('/update-prompts', async (req, res) => {
    try {
        const prompts = req.body;
        console.log('Received prompts:', prompts);

        // Path to the .env file
        const envFilePath = path.resolve(__dirname, '../.env');

        // Read current .env content
        let envContent = fs.readFileSync(envFilePath, 'utf8');

        // Remove existing prompt keys
        const promptKeys = Object.keys(prompts);
        const promptKeysSet = new Set(promptKeys.map(key => key.toUpperCase()));
        const updatedEnvLines = [];

        envContent.split('\n').forEach(line => {
            const [key] = line.split('=');
            if (key && !promptKeysSet.has(key.trim())) {
                updatedEnvLines.push(line);
            }
        });

        // Append new or updated prompts
        promptKeys.forEach(key => {
            updatedEnvLines.push(`${key.toUpperCase()}=${prompts[key]}`);
        });

        // Write updated content to .env file
        fs.writeFileSync(envFilePath, updatedEnvLines.join('\n'), 'utf8');

        res.status(200).json({ message: 'Prompts updated successfully', prompts });
    } catch (error) {
        console.error('Error updating prompts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
