/**
 * Quote Schema
 * 
 * Зберігає кожен розрахунок як snapshot для CRM/leads
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuoteDocument = Quote & Document;

@Schema({ timestamps: true })
export class Quote {
  @Prop({ required: true })
  quoteNumber: string; // QT-2024-001234

  @Prop()
  vin?: string;

  @Prop()
  lotNumber?: string;

  @Prop()
  vehicleTitle?: string;

  // Input parameters
  @Prop({ required: true, type: Object })
  input: {
    price: number;
    port: string;
    vehicleType: string;
  };

  // Breakdown snapshot
  @Prop({ required: true, type: Object })
  breakdown: {
    carPrice: number;
    auctionFee: number;
    insurance: number;
    usaInland: number;
    ocean: number;
    usaHandlingFee: number;
    bankFee: number;
    euPortHandlingFee: number;
    euDelivery: number;
    companyFee: number;
    customs: number;
    documentationFee: number;
    titleFee: number;
  };

  @Prop({ required: true })
  visibleTotal: number;

  @Prop({ required: true })
  internalTotal: number;

  @Prop({ required: true })
  hiddenFee: number;

  @Prop({ required: true })
  profileCode: string;

  // Links
  @Prop({ type: Types.ObjectId, ref: 'Lead' })
  leadId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop({ default: 'draft', enum: ['draft', 'sent', 'accepted', 'expired', 'rejected'] })
  status: string;

  @Prop()
  expiresAt?: Date;

  @Prop()
  notes?: string;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);

QuoteSchema.index({ quoteNumber: 1 }, { unique: true });
QuoteSchema.index({ vin: 1 });
QuoteSchema.index({ leadId: 1 });
QuoteSchema.index({ status: 1 });
