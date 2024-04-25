import { object, string, number, boolean } from "zod";

export const createProductSchema = object({
  description: string().trim(),
  name: string().trim(),
  price: number().positive(),
  content: string().trim(),
  imageUrl: string().trim().optional(),
  parentProductId: number().positive().optional(),
  type: string().trim().optional(),
});

export const updateProductSchema = object({
  description: string().trim().optional(),
  name: string().trim().optional(),
  price: number().positive().optional(),
  content: string().trim().optional(),
  imageUrl: string().trim().optional(),
  parentProductId: number().positive().optional(),
  type: string().trim().optional(),
});

export const createProductComplementTypeSchema = object({
  name: string().trim(),
  required: boolean(),
  maxSelectable: number().positive(),
});

export const updateProductComplementTypeSchema = object({
  name: string().trim().optional(),
  required: boolean().optional(),
  maxSelectable: number().positive().optional(),
});
