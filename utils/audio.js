const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();
const Anthropic = require("@anthropic-ai/sdk");

async function transcribeAudio(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('model', 'whisper-1');

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    ...formData.getHeaders()  
                }
            }
        );
        return response.data.text;
    } catch (error) {
        console.error('Error during transcription:', error.response ? error.response.data : error.message);
        throw new Error('Transcription failed');
    }
}

function getPromptByCategory(label) {
    const match = label.match(/(\D+)(\d*)/); 
    if (!match) {
        throw new Error('Invalid label format');
    }

    const baseLabel = match[1].trim().toUpperCase();
    const promptKey = `PROMPT_${baseLabel}`;

    const basePrompt = process.env[promptKey] || process.env.PROMPT_DEFAULT;
    
    return `${basePrompt} Correct the following transcribed text if needed. If corrections are made, provide ONLY the corrected text. If no changes are needed, repeat the original text exactly. Do not include any explanations or additional information. Here is the text to correct: `;
}

async function getChatCompletion(label, transcript) {
    const promptTemplate = getPromptByCategory(label);

    if (!promptTemplate) {
        throw new Error(`No prompt found for label: ${label}`);
    }

    const prompt = `${promptTemplate}"${transcript}"`;
    
    console.log(`Prompt: ${prompt}`);

    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
    });

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1000,
            temperature: 0,
            messages: [{ role: 'user', content: prompt }]
        });

        if (response.content && response.content.length > 0) {
            const content = response.content[0];
            if (content.type === 'text') {
                // Remove any quotation marks that might have been added by the AI
                return content.text.trim().replace(/^"|"$/g, '');
            } else {
                throw new Error('Unexpected content type in the response');
            }
        } else {
            throw new Error('No content in the response');
        }
    } catch (error) {
        console.error('Error during chat completion:', error);
        throw new Error('Chat completion failed');
    }
}

module.exports = {
    transcribeAudio,
    getChatCompletion
};