import { Bard } from "googlebard";
import readline from "readline";


const promptText = `Task: Write a blogpost
Topic: Generating AI Blog posts creates a lot of fake content on the web
Style: Casual
Tone: Friendly
Audience: 30-year old
Length: 5 outlines and 4 paragraphs each
Format: JSON
Schema (Make sure to match it):
{
    id: string;
    title: string;
    tags: string[];
    content: string;
    estimatedReadingTimeMinutes: number;
    relatedTopicsTags: string[];
}
`;
let conversationId = "08826add-930f-45e7-9400-1d0cec59858e"; 


let cookies = `__Secure-1PSID=Wgh6U6Husxlvs5HDBc2-cCnJ1WiAn5-T7kn73l-IAatEC55Ki2yzQMutR76oa5JyYSMPNQ.`;

let bot = new Bard(cookies);

async function main() {
  const response = await bot.ask(promptText, conversationId);
  console.log(response);
}

main();