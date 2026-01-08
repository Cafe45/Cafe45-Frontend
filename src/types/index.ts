// --- ENUMS ---
export enum WorkFlowStatus { Pending = 1, InProgress = 2, Completed = 3 }
export enum CakeSize { SixPieces = 0, EightPieces = 1, TwelvePieces = 2, LargerOrder = 3 }
export enum CakeFlavor { Chocolate = 0, Raspberry = 1, Vanilla = 2, Strawberry = 3, Lemon = 4, Custom = 5 }

// --- FORMULÄR DTO ---
export interface CakeInquiryCommand {
  size: CakeSize;
  flavor: CakeFlavor;
  description: string;
  decorations: boolean;
  cake_text: boolean;    // Viktigt: snake_case för att matcha DB
  extra_filling: boolean; // Viktigt: snake_case för att matcha DB
  customer_name: string;
  phone_number: string;
  email?: string;
  workflow_status: number;
}

// --- FÄRDIGA TÅRTOR (NY!) ---
export interface StandardCake {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  ingredients: string;
}