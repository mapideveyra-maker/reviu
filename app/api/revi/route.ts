import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
export async function POST(request: Request) {
  try {
    const { messages, system } = await request.json()
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    })
    return NextResponse.json({
      response: response.content[0].type === "text" ? response.content[0].text : "Sorry I could not process that.",
    })
  } catch (error: any) {
    console.error("Revi API error:", error)
    return NextResponse.json({
      response: "I am having a moment — try again in a second!",
    })
  }
}