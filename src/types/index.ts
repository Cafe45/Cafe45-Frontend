// --- ENUMS (Måste matcha siffrorna i C#) ---

export enum WorkFlowStatus {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
}

export enum CakeSize {
  SixPieces = 0,
  EightPieces = 1,
  TwelvePieces = 2,
  LargerOrder = 3,
}

export enum CakeFlavor {
  Chocolate = 0,
  Raspberry = 1,
  Vanilla = 2,
  Strawberry = 3,
  Lemon = 4,
  Custom = 5,
}

export enum DeliveryType {
  Pickup = 0,
  HomeDelivery = 1,
}

// --- DTOs (Vad vi skickar till POST /inquiry) ---

export interface CakeInquiryCommand {
  size: CakeSize;
  flavor: CakeFlavor;
  description: string;
  decorations: boolean;
  cakeText: boolean;
  extraFilling: boolean;
  customerName: string;
  phoneNumber: string;
  email?: string; // Frivillig
}

// --- OUTPUT/ADMIN DTOs ---

export interface CakeInquiry extends CakeInquiryCommand {
  id: string;
  workFlowStatus: WorkFlowStatus;
  inquiryDate: string;
}

export interface AdminDashboardDto {
  cakeInquiries: CakeInquiry[];
  orders: any[]; // Vi fyller på Order interface senare om det behövs
}