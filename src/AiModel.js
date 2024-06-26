// aiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the GoogleGenerativeAI instance with your API key
const genAi = new GoogleGenerativeAI('AIzaSyAyFeKnbIOoQ7bLaAzjJJjYNDlAJxUAPP0');

// Define the function to get the response based on the prompt
const processResponse = (response) => {
    // Example processing logic:
    // Assuming the response is a string, split it into paragraphs and return as an array
    const paragraphs = response.split('\n\n').map(paragraph => paragraph.trim()).filter(paragraph => paragraph);
    return paragraphs;
};
export async function getAIResponse(prompt) {
    try {
        // Get the generative model
        const model = genAi.getGenerativeModel({
            model: "gemini-1.5-pro"
        });
        
        // Generate content based on the prompt
        let r = await model.generateContent(prompt);
        if(r.error) return 500;
        r = processResponse(r.response.text());

        // Return the response
        return r;
    } catch (error) {
        console.error('Error generating content:', error);
        throw error;
    }
}
