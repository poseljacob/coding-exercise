import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Item } from '@prisma/client';
import OpenAI from 'openai';
import { PrismaService } from '../prisma.service';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI();
  }

  async convertFile(file: Express.Multer.File) {
    const filePath = this.getFilePath(file.originalname);
    const items = await this.prisma.item.findMany();

    try {
      const assistant = await this.createAssistant(items);
      const uploadedFile = await this.uploadFile(filePath);
      const thread = await this.createThread(assistant, uploadedFile);
      const run = await this.runThread(thread.id, assistant.id);
      const jsonString = await this.extractJsonString(run, thread.id);

      await this.cleanupAssistant(assistant.id);

      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error processing file:', error);
      throw new InternalServerErrorException('Error processing file');
    }
  }

  private getFilePath(filename: string): string {
    // Can be replaced with cloud storage like S3
    return path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'apps',
      'uploads',
      filename
    );
  }

  private async uploadFile(filePath: string): Promise<OpenAI.Files.FileObject> {
    return this.openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'assistants',
    });
  }

  private async createThread(
    assistant: OpenAI.Beta.Assistants.Assistant,
    file: OpenAI.Files.FileObject
  ) {
    return this.openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: 'Analyze this purchase order and return in JSON format.',
          attachments: [{ file_id: file.id, tools: [{ type: 'file_search' }] }],
        },
      ],
    });
  }

  private async createAssistant(
    items: Item[]
  ): Promise<OpenAI.Beta.Assistants.Assistant> {
    const instructions = `
      You are an AI assistant that receives files of any format representing purchase orders for an ecommerce brand. 
      Analyze the file and convert it into the specified JSON format. 
      You must ONLY response with JSON format. Do not respond with anything else. 
      {
          "vendor_name": "Vendor",
          "order_date": "2022-01-01",
          "expected_delivery_date": "2022-01-01",
          "purchase_order_line_items": [
          {
              "item_id": "1",
              "quantity": 1,
              "unit_cost": 1.0
          }
          ]
      }
      Items:
      ${items
        .map((item) => `SKU: ${item.sku}, Name: ${item.name}, ID: ${item.id}`)
        .join('\n')}
    `;

    return this.openai.beta.assistants.create({
      name: 'Purchase Order Converter',
      instructions,
      model: 'gpt-4o',
      tools: [{ type: 'file_search' }],
    });
  }

  private async runThread(threadId: string, assistantId: string) {
    return this.openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    });
  }

  private async cleanupAssistant(assistantId: string) {
    await this.openai.beta.assistants.del(assistantId);
  }

  private async extractJsonString(
    run: OpenAI.Beta.Threads.Run,
    threadId: string
  ): Promise<string> {
    if (run.status === 'completed') {
      const messages = await this.openai.beta.threads.messages.list(threadId, {
        run_id: run.id,
      });
      const message = messages.data.pop();
      if (message?.content[0]?.type === 'text') {
        return message.content[0].text.value.replace(/```json|```/g, '').trim();
      }
    }
    throw new InternalServerErrorException('Error processing file');
  }
}
